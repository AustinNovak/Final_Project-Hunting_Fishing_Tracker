const express = require("express");
const router = express.Router();
const { Trip, Species, User } = require("../database/setup");
const auth = require("../middleware/auth");
const { Op } = require("sequelize");


// GET all trips
// Admin: all trips
// User: only their trips

router.get("/", auth, async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.id };

    const trips = await Trip.findAll({
      where,
      include: [{ model: User, attributes: ["id", "name", "email"] }]
    });

    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

/*
 SEARCH / FILTER trips
 Query params:
  - type (fishing | hunting)
  - startDate
  - endDate
*/
router.get("/search", auth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const where = req.user.role === "admin"
      ? {}
      : { userId: req.user.id };

    if (type) where.type = type;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const trips = await Trip.findAll({ where });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search trips" });
  }
});


// GET trip by ID (ownership enforced)

router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [{ model: Species }]
    });

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(trip);
  } catch (err) {
    console.error("CREATE TRIP ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});


// GET trip with species (relationship endpoint)

router.get("/:id/full", auth, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [{ model: Species }]
    });

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
});


// POST create trip (logged-in user)

router.post("/", auth, async (req, res) => {
  try {
    const { date, location, type, weather, notes, gear } = req.body;

    if (!date || !location || !type) {
      return res.status(400).json({
        error: "date, location, and type required"
      });
    }

    if (!["fishing", "hunting"].includes(type)) {
      return res.status(400).json({ error: "type must be fishing or hunting" });
    }

    const trip = await Trip.create({
      date,
      location,
      type,
      weather: weather || null,
      notes: notes || null,
      gear: gear || null,
      userId: req.user.id
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error("CREATE TRIP ERROR:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});


// PUT update trip (ownership enforced)

router.put("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await trip.update(req.body);
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Failed to update trip" });
  }
});


// DELETE trip (ownership enforced)

router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await trip.destroy();
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

module.exports = router;
