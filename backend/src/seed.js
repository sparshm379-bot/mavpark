const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All UTA parking lots with real coordinates and permit types
const LOTS = [
  // ── Garages ──────────────────────────────────────────────────
  { name: 'Maverick Parking Garage', lat: 32.72997, lng: -97.11423, lotType: 'Student Commuter', isGarage: true, capacity: 1500 },
  { name: 'West Campus Garage',      lat: 32.73150, lng: -97.11985, lotType: 'Student Commuter', isGarage: true, capacity: 1200 },
  { name: 'College Park Garage',     lat: 32.73381, lng: -97.10873, lotType: 'General',          isGarage: true, capacity: 1100 },
  { name: 'Park South Garage',       lat: 32.72648, lng: -97.11578, lotType: 'Student Commuter', isGarage: true, capacity: 500  },

  // ── Surface Lots ─────────────────────────────────────────────
  { name: 'Lot 1',  lat: 32.73312, lng: -97.11642, lotType: 'Faculty/Staff',        isGarage: false, capacity: 120 },
  { name: 'Lot 2',  lat: 32.73198, lng: -97.11501, lotType: 'Faculty/Staff',        isGarage: false, capacity: 95  },
  { name: 'Lot 3',  lat: 32.73058, lng: -97.11380, lotType: 'Student Commuter',     isGarage: false, capacity: 210 },
  { name: 'Lot 4',  lat: 32.72920, lng: -97.11280, lotType: 'Student Commuter',     isGarage: false, capacity: 180 },
  { name: 'Lot 5',  lat: 32.72820, lng: -97.11190, lotType: 'General',              isGarage: false, capacity: 160 },
  { name: 'Lot 6',  lat: 32.72750, lng: -97.11350, lotType: 'Student Commuter',     isGarage: false, capacity: 200 },
  { name: 'Lot 7',  lat: 32.72700, lng: -97.11500, lotType: 'Visitor/Short Term',   isGarage: false, capacity: 80  },
  { name: 'Lot 8',  lat: 32.72850, lng: -97.11600, lotType: 'Faculty/Staff',        isGarage: false, capacity: 140 },
  { name: 'Lot 9',  lat: 32.73000, lng: -97.11700, lotType: 'Reserved Zone',        isGarage: false, capacity: 60  },
  { name: 'Lot 10', lat: 32.73100, lng: -97.11800, lotType: 'Student Upgrade',      isGarage: false, capacity: 110 },
  { name: 'Lot 11', lat: 32.73250, lng: -97.11900, lotType: 'Faculty/Staff',        isGarage: false, capacity: 130 },
  { name: 'Lot 12', lat: 32.73400, lng: -97.11750, lotType: 'General',              isGarage: false, capacity: 175 },
  { name: 'Lot 13', lat: 32.73450, lng: -97.11550, lotType: 'Student Commuter',     isGarage: false, capacity: 220 },
  { name: 'Lot 14', lat: 32.73380, lng: -97.11350, lotType: 'Faculty/Staff',        isGarage: false, capacity: 90  },
  { name: 'Lot 15', lat: 32.73280, lng: -97.11200, lotType: 'Student Upgrade',      isGarage: false, capacity: 100 },
  { name: 'Lot 16', lat: 32.73180, lng: -97.11050, lotType: 'General',              isGarage: false, capacity: 155 },
  { name: 'Lot 17', lat: 32.73080, lng: -97.10950, lotType: 'Faculty/Staff',        isGarage: false, capacity: 85  },
  { name: 'Lot 18', lat: 32.72980, lng: -97.10880, lotType: 'Visitor/Short Term',   isGarage: false, capacity: 70  },
  { name: 'Lot 19', lat: 32.72880, lng: -97.10820, lotType: 'Student Commuter',     isGarage: false, capacity: 190 },
  { name: 'Lot 20', lat: 32.72780, lng: -97.10780, lotType: 'General',              isGarage: false, capacity: 145 },
  { name: 'Lot 21', lat: 32.72680, lng: -97.10850, lotType: 'Faculty/Staff',        isGarage: false, capacity: 110 },
  { name: 'Lot 22', lat: 32.72600, lng: -97.10950, lotType: 'Student Commuter',     isGarage: false, capacity: 200 },
  { name: 'Lot 23', lat: 32.72550, lng: -97.11100, lotType: 'Reduced Rate',         isGarage: false, capacity: 130 },
  { name: 'Lot 24', lat: 32.72620, lng: -97.11300, lotType: 'General',              isGarage: false, capacity: 160 },
  { name: 'Lot 25', lat: 32.72720, lng: -97.11750, lotType: 'Student Commuter',     isGarage: false, capacity: 240 },
  { name: 'Lot 26', lat: 32.72580, lng: -97.11900, lotType: 'Remote Park and Ride', isGarage: false, capacity: 350 },
  { name: 'Lot 27', lat: 32.72480, lng: -97.12050, lotType: 'Remote Park and Ride', isGarage: false, capacity: 400 },
  { name: 'Lot 28', lat: 32.73480, lng: -97.11100, lotType: 'Student Commuter',     isGarage: false, capacity: 180 },
  { name: 'Lot 29', lat: 32.73550, lng: -97.10900, lotType: 'Faculty/Staff',        isGarage: false, capacity: 95  },
  { name: 'Lot 30', lat: 32.73600, lng: -97.10750, lotType: 'General',              isGarage: false, capacity: 120 },
  { name: 'Lot 49', lat: 32.73020, lng: -97.11540, lotType: 'Student Commuter',     isGarage: false, capacity: 280 },
  { name: 'Lot 50', lat: 32.73120, lng: -97.11650, lotType: 'Student Commuter',     isGarage: false, capacity: 320 },
  { name: 'Lot 51', lat: 32.73220, lng: -97.11480, lotType: 'Faculty/Staff',        isGarage: false, capacity: 140 },
  { name: 'Lot 52', lat: 32.73320, lng: -97.11280, lotType: 'General',              isGarage: false, capacity: 160 },

  // ── Special ───────────────────────────────────────────────────
  { name: 'Greek Row Lot',       lat: 32.72900, lng: -97.11450, lotType: 'Resident',           isGarage: false, capacity: 120 },
  { name: 'Visitor Center Lot',  lat: 32.73150, lng: -97.11320, lotType: 'Visitor/Short Term', isGarage: false, capacity: 60  },
  { name: 'Stadium Lot A',       lat: 32.73480, lng: -97.11450, lotType: 'General',            isGarage: false, capacity: 300 },
  { name: 'Stadium Lot B',       lat: 32.73550, lng: -97.11600, lotType: 'General',            isGarage: false, capacity: 280 },
  { name: 'ADA Central Lot',     lat: 32.73050, lng: -97.11250, lotType: 'ADA',               isGarage: false, capacity: 40  },
];

const PERMIT_TYPES = ['Student', 'Preferred', 'Visitor', 'Hourly'];
const ROWS = ['A', 'B', 'C', 'D'];
const SPOTS_PER_ROW = 10;

async function main() {
  console.log('Clearing existing data...');
  await prisma.report.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.garage.deleteMany();

  console.log('Seeding UTA parking lots...');

  for (const lot of LOTS) {
    const garage = await prisma.garage.create({
      data: {
        name: lot.name,
        lat: lot.lat,
        lng: lot.lng,
        lotType: lot.lotType,
        isGarage: lot.isGarage,
        capacity: lot.capacity,
        available: -1,
      },
    });

    const levels = lot.isGarage ? 5 : 1;

    for (let level = 1; level <= levels; level++) {
      const floor = await prisma.floor.create({
        data: { garageId: garage.id, level },
      });

      for (const row of ROWS) {
        for (let num = 1; num <= SPOTS_PER_ROW; num++) {
          await prisma.spot.create({
            data: {
              floorId: floor.id,
              row,
              number: num,
              permitType: PERMIT_TYPES[Math.floor(Math.random() * PERMIT_TYPES.length)],
            },
          });
        }
      }
    }
    console.log(`  ✓ ${lot.name}`);
  }

  console.log(`\nDone. Seeded ${LOTS.length} lots.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
