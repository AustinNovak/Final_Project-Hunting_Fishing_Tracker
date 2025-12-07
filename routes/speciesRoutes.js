// routes/speciesRoutes.js
const express = require('express');
const router = express.Router();
const { Species, Trip } = require('../database/setup');

// GET all species records
router.get('/', async (req, res) => {
  try {
    const list = await Species.findAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

// GET one species record
router.get('/:id', async (req, res) => {
  try {
    const record = await Species.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// POST create species record for a trip
router.post('/', async (req, res) => {
  try {
    const { speciesName, quantity = 1, measurement, notes, tripId } = req.body;
    if (!speciesName || !tripId) return res.status(400).json({ error: 'speciesName and tripId required' });
    const trip = await Trip.findByPk(tripId);
    if (!trip) return res.status(400).json({ error: 'tripId not found' });
    const record = await Species.create({ speciesName, quantity, measurement, notes, tripId });
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create species record' });
  }
});

// PUT update species record
router.put('/:id', async (req, res) => {
  try {
    const record = await Species.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    await record.update(req.body);
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE species record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Species.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;
