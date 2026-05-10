require('dotenv').config();
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

// Geohash encoder (same algorithm as Modii uses)
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
function encodeGeohash(lat, lng, precision = 6) {
  let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
  let hash = '', bits = 0, bit = 0, even = true;
  while (hash.length < precision) {
    if (even) {
      const mid = (minLng + maxLng) / 2;
      if (lng > mid) { bit = bit * 2 + 1; minLng = mid; }
      else { bit *= 2; maxLng = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat > mid) { bit = bit * 2 + 1; minLat = mid; }
      else { bit *= 2; maxLat = mid; }
    }
    even = !even;
    if (++bits === 5) { hash += BASE32[bit]; bits = 0; bit = 0; }
  }
  return hash;
}

// UTA campus geohashes that have Firebase sensor data (discovered empirically)
const UTA_GEOHASHES = ['9vffjt', '9vffjv', '9vffjy', '9vffjz', '9vffnh', '9vffnj', '9vffnm', '9vffnn', '9vffnp', '9vffnq'];

function fetchFirebase(geohash) {
  return new Promise((resolve) => {
    const req = https.get(
      `https://spotdataappios-1498709221463.firebaseio.com/availability/${geohash}.json`,
      (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!data || typeof data !== 'object') return resolve(null);
            let open = 0, total = 0;
            for (const spot of Object.values(data)) {
              if (spot?.availabilityState !== undefined) {
                total++;
                // availabilityState: 1 = open, 2 = occupied
                if (spot.availabilityState === 1) open++;
              }
            }
            resolve(total > 0 ? { open, total, ratio: open / total } : null);
          } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
  });
}

async function scrape() {
  console.log(`[${new Date().toISOString()}] Polling Firebase availability...`);

  // 1. Fetch all UTA campus geohashes in parallel
  const results = await Promise.all(UTA_GEOHASHES.map(async gh => {
    const data = await fetchFirebase(gh);
    if (data) console.log(`  ${gh}: ${data.open}/${data.total} open (${Math.round(data.ratio * 100)}%)`);
    return [gh, data];
  }));

  const geohashData = Object.fromEntries(results.filter(([, d]) => d !== null));

  if (Object.keys(geohashData).length === 0) {
    console.log('  No Firebase data available');
    return;
  }

  // 2. Get all garages from DB
  const garages = await prisma.garage.findMany();

  // 3. For each garage, find its geohash and update available count
  let updated = 0;
  for (const garage of garages) {
    const gh = encodeGeohash(garage.lat, garage.lng, 6);
    const data = geohashData[gh];

    if (!data) {
      // No sensor data for this area — keep as -1 (no data)
      continue;
    }

    // Use the geohash occupancy ratio to estimate this lot's availability
    // If the geohash has 80% of spots open, we estimate this lot is also ~80% available
    const available = Math.round(garage.capacity * data.ratio);

    await prisma.garage.update({
      where: { id: garage.id },
      data: { available },
    });
    updated++;
  }

  console.log(`  Updated ${updated}/${garages.length} garages from sensor data`);
}

async function run() {
  try {
    await scrape();
  } catch (e) {
    console.error('Scrape error:', e.message);
  }
  setInterval(async () => {
    try { await scrape(); }
    catch (e) { console.error('Scrape error:', e.message); }
  }, INTERVAL_MS);
}

// Run immediately when required
run();
