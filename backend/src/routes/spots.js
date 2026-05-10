const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/spots/:id — spot detail with latest report
router.get('/:id', async (req, res) => {
  try {
    const spot = await prisma.spot.findUnique({
      where: { id: req.params.id },
      include: {
        reports: {
          orderBy: { reportedAt: 'desc' },
          take: 1,
        },
        floor: { include: { garage: true } },
      },
    });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    res.json(spot);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
