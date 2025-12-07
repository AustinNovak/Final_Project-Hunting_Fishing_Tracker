// database/seed.js
const bcrypt = require('bcryptjs');
const { db, User, Trip, Species, setupDatabase } = require('./setup');

async function seed() {
  try {
    // Reset DB so seed is deterministic
    await setupDatabase({ force: true });

    // Create sample users
    const hashed = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      { name: 'Austin Novak', email: 'austin@example.com', password: hashed },
      { name: 'Maya Rivers', email: 'maya@example.com', password: hashed }
    ], { returning: true });

    // Create sample trips
    const trips = await Trip.bulkCreate([
      {
        date: '2025-06-02',
        location: 'Lake Bluewater',
        type: 'fishing',
        weather: 'Sunny, light wind',
        notes: 'Used plastics — very productive',
        gear: 'Rod A, Reel X, 6lb test',
        userId: users[0].id
      },
      {
        date: '2025-10-15',
        location: 'Pine Ridge',
        type: 'hunting',
        weather: 'Overcast, cold',
        notes: 'Short stalk, one deer',
        gear: '98cm rifle, camo jacket',
        userId: users[1].id
      }
    ], { returning: true });

    // Add species entries
    await Species.bulkCreate([
      {
        speciesName: 'Largemouth Bass',
        quantity: 3,
        measurement: '1.2 lbs, 2.3 lbs, 1.8 lbs',
        notes: 'Caught near weedlines',
        tripId: trips[0].id
      },
      {
        speciesName: 'White-tailed Deer',
        quantity: 1,
        measurement: '120 lbs',
        notes: 'Rifle shot, recorded field notes',
        tripId: trips[1].id
      }
    ]);

    console.log('Seed complete');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await db.close();
  }
}

seed();
