require('dotenv').config();
const express = require('express');
const cors = require('cors');

const garagesRouter = require('./routes/garages');
const spotsRouter = require('./routes/spots');
const reportsRouter = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/garages', garagesRouter);
app.use('/api/spots', spotsRouter);
app.use('/api/reports', reportsRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MavPark backend running on port ${PORT}`));
