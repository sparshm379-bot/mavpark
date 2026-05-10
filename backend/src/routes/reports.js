const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reports
router.post('/', async (req, res) => {
  const { spotId, status, userId } = req.body;
  if (!spotId || !['open', 'taken'].includes(status)) {
    return res.status(400).json({ error: 'spotId and status (open|taken) required' });
  }
  try {
    const report = await prisma.report.create({
      data: { spotId, status, userId: userId || null },
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/lot-status — all lots with availability
router.get('/lot-status', async (req, res) => {
  try {
    const garages = await prisma.garage.findMany({
      include: {
        floors: {
          include: {
            spots: {
              include: {
                reports: { orderBy: { reportedAt: 'desc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    const status = garages.map((g) => {
      const spots = g.floors.flatMap((f) => f.spots);
      const crowdOpen = spots.filter((s) => s.reports[0]?.status === 'open').length;
      const crowdTaken = spots.filter((s) => s.reports[0]?.status === 'taken').length;

      // Prefer Modii sensor data if available, fall back to crowdsource
      const sensorAvailable = g.available >= 0 ? g.available : null;
      const openCount = sensorAvailable ?? crowdOpen;
      const totalCount = g.capacity || spots.length;

      return {
        id: g.id,
        name: g.name,
        lat: g.lat,
        lng: g.lng,
        lotType: g.lotType,
        isGarage: g.isGarage,
        capacity: totalCount,
        available: openCount,
        source: sensorAvailable !== null ? 'sensor' : 'crowd',
      };
    });

    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reports/scraper — receives data from local Modii scraper
router.post('/scraper', async (req, res) => {
  const lots = req.body;
  if (!Array.isArray(lots)) return res.status(400).json({ error: 'Expected array' });

  try {
    const garages = await prisma.garage.findMany();
    let updated = 0;

    for (const lot of lots) {
      const match = garages.find(g =>
        g.name.toLowerCase().includes(lot.name?.toLowerCase()) ||
        lot.name?.toLowerCase().includes(g.name?.toLowerCase())
      );
      if (match && lot.available >= 0) {
        await prisma.garage.update({
          where: { id: match.id },
          data: { available: lot.available, capacity: lot.capacity || match.capacity },
        });
        updated++;
      }
    }

    res.json({ updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
