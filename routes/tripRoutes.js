// routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const { Trip, Species, User } = require('../database/setup');

// GET all trips (include user)
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET trip by id (with species)
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [{ model: Species }]
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// POST create trip
router.post('/', async (req, res) => {
  try {
    const { date, location, type, weather, notes, gear, userId } = req.body;

    if (!date || !location || !type || !userId) {
      return res.status(400).json({ 
        error: 'date, location, type, and userId required' 
      });
    }

    // Validate type is valid ENUM value
    if (!['fishing', 'hunting'].includes(type)) {
      return res.status(400).json({ error: 'type must be fishing or hunting' });
    }

    // Validate user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'userId not found' });
    }

    const trip = await Trip.create({
      date,
      location,
      type,
      weather: weather || null,
      notes: notes || null,
      gear: gear || null,
      userId
    });

    res.status(201).json(trip);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});


// PUT update trip
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    await trip.update(req.body);
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE trip
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Trip.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;
