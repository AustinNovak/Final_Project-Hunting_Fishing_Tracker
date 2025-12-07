// database/setup.js
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'final_project.db';
const storagePath = path.join(__dirname, DB_NAME);

// Create Sequelize instance
const db = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false
});

// Define models here centrally (clean & avoids circular issues)

// User
const User = db.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: true }
});

// Trip
const Trip = db.define('Trip', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('fishing', 'hunting'), allowNull: false },
  weather: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  gear: { type: DataTypes.TEXT, allowNull: true } // comma-separated string for MVP
});

// Species (what was caught / hunted on a trip)
const Species = db.define('Species', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  speciesName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  measurement: { type: DataTypes.STRING, allowNull: true }, // e.g., "3.2 lbs" or "24 in"
  notes: { type: DataTypes.TEXT, allowNull: true }
});

// Relationships
User.hasMany(Trip, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'userId' });

Trip.hasMany(Species, { foreignKey: 'tripId', onDelete: 'CASCADE' });
Species.belongsTo(Trip, { foreignKey: 'tripId' });

// Helper to initialize DB (call with force true for fresh DB)
async function setupDatabase({ force = false } = {}) {
  try {
    await db.authenticate();
    await db.sync({ force });
    console.log('Database setup complete (force=' + force + ')');
  } catch (err) {
    console.error('DB setup error:', err);
    throw err;
  }
}

// Export
module.exports = {
  db,
  User,
  Trip,
  Species,
  setupDatabase
};
