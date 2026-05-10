const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reports — submit open/taken report
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

// GET /api/reports/lot-status — aggregated open/taken counts per garage
router.get('/lot-status', async (req, res) => {
  try {
    const garages = await prisma.garage.findMany({
      include: {
        floors: {
          include: {
            spots: {
              include: {
                reports: {
                  orderBy: { reportedAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const status = garages.map((g) => {
      const spots = g.floors.flatMap((f) => f.spots);
      const open = spots.filter((s) => s.reports[0]?.status === 'open').length;
      const taken = spots.filter((s) => s.reports[0]?.status === 'taken').length;
      const total = spots.length;
      return { id: g.id, name: g.name, lat: g.lat, lng: g.lng, open, taken, total };
    });

    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
