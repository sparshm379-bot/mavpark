const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/garages — all garages
router.get('/', async (req, res) => {
  try {
    const garages = await prisma.garage.findMany({
      include: { floors: { include: { spots: true } } },
    });
    res.json(garages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/garages/:id/floors — floors with spots + latest report per spot
router.get('/:id/floors', async (req, res) => {
  try {
    const floors = await prisma.floor.findMany({
      where: { garageId: req.params.id },
      orderBy: { level: 'asc' },
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
    });
    res.json(floors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
