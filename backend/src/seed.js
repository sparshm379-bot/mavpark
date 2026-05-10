const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GARAGES = [
  { name: 'Maverick Parking Garage', lat: 32.7299, lng: -97.1142 },
  { name: 'West Campus Garage', lat: 32.7315, lng: -97.1198 },
  { name: 'Park South', lat: 32.7265, lng: -97.1155 },
  { name: 'Park North', lat: 32.7335, lng: -97.1120 },
];

const PERMIT_TYPES = ['Student', 'Preferred', 'Visitor', 'Hourly'];
const LEVELS = 5;
const ROWS = ['A', 'B', 'C', 'D'];
const SPOTS_PER_ROW = 10;

async function main() {
  console.log('Seeding database...');

  for (const g of GARAGES) {
    const garage = await prisma.garage.create({ data: g });

    for (let level = 1; level <= LEVELS; level++) {
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
    console.log(`  Seeded: ${g.name}`);
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
