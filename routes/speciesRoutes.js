const express = require("express");
const router = express.Router();
const { Species, Trip } = require("../database/setup");
const auth = require("../middleware/auth");
const { Op } = require("sequelize");


// GET all species records
// Admin: all records
// User: only species from their trips

router.get("/", auth, async (req, res) => {
  try {
    const where = req.user.role === "admin"
      ? {}
      : { "$Trip.userId$": req.user.id };

    const list = await Species.findAll({
      include: [{ model: Trip }],
      where
    });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch species" });
  }
});


// SEARCH species by name

router.get("/search", auth, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "name query required" });
    }

    const where = {
      speciesName: { [Op.like]: `%${name}%` }
    };

    const results = await Species.findAll({
      include: [{ model: Trip }],
      where
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search species" });
  }
});


// GET one species record (ownership enforced)

router.get("/:id", auth, async (req, res) => {
  try {
    const record = await Species.findByPk(req.params.id, {
      include: [{ model: Trip }]
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (
      record.Trip.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch record" });
  }
});


// POST create species record

router.post("/", auth, async (req, res) => {
  try {
    const { speciesName, quantity = 1, measurement, notes, tripId } = req.body;

    if (!speciesName || !tripId) {
      return res
        .status(400)
        .json({ error: "speciesName and tripId required" });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(400).json({ error: "tripId not found" });
    }

    if (trip.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const record = await Species.create({
      speciesName,
      quantity,
      measurement,
      notes,
      tripId
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create species record" });
  }
});


// PUT update species record

router.put("/:id", auth, async (req, res) => {
  try {
    const record = await Species.findByPk(req.params.id, {
      include: [{ model: Trip }]
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (
      record.Trip.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await record.update(req.body);
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update record" });
  }
});


// DELETE species record

router.delete("/:id", auth, async (req, res) => {
  try {
    const record = await Species.findByPk(req.params.id, {
      include: [{ model: Trip }]
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (
      record.Trip.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await record.destroy();
    res.json({ message: "Record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

module.exports = router;
