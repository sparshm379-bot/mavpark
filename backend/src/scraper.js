require('dotenv').config();
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MODII_URL = 'https://uta.modii.co/v2/finder';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function scrape() {
  console.log(`[${new Date().toISOString()}] Scraping Modii...`);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    const captured = [];

    // Intercept all API responses
    page.on('response', async (response) => {
      const url = response.url();
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;

      try {
        const json = await response.json();
        // Modii returns lot/zone data in arrays — look for objects with occupancy/availability
        if (Array.isArray(json) && json.length > 0 && (json[0].name || json[0].lotName || json[0].available !== undefined)) {
          captured.push({ url, data: json });
          console.log(`  Captured: ${url} (${json.length} items)`);
        } else if (json && (json.lots || json.zones || json.features)) {
          captured.push({ url, data: json });
          console.log(`  Captured object: ${url}`);
        }
      } catch (_) {}
    });

    await page.goto(MODII_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000)); // extra wait for lazy loads

    if (captured.length === 0) {
      console.log('  No API data captured — Modii may require auth. Skipping update.');
      return;
    }

    // Try to parse captured data into lot availability
    for (const { url, data } of captured) {
      const items = Array.isArray(data) ? data : (data.lots || data.zones || data.features || []);
      for (const item of items) {
        const name = item.name || item.lotName || item.label;
        const available = item.available ?? item.availableSpaces ?? item.openSpaces ?? -1;
        const capacity = item.capacity ?? item.totalSpaces ?? 0;

        if (!name) continue;

        // Find matching garage in our DB (fuzzy name match)
        const garages = await prisma.garage.findMany();
        const match = garages.find(g =>
          g.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(g.name.toLowerCase())
        );

        if (match && available >= 0) {
          await prisma.garage.update({
            where: { id: match.id },
            data: { available, capacity: capacity || match.capacity },
          });
          console.log(`  Updated: ${match.name} → ${available}/${capacity || match.capacity} available`);
        }
      }
    }

    console.log(`  Done.`);
  } catch (err) {
    console.error('  Scrape error:', err.message);
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

async function run() {
  await scrape();
  setInterval(scrape, INTERVAL_MS);
}

run();
