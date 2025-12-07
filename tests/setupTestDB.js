// tests/setupTestDB.js
const fs = require('fs');
const path = require('path');

// Use a separate test database file so we don't touch production/dev DB
const TEST_DB = 'test_final_project.db';

// force the DB name before requiring the app & setup
process.env.DB_NAME = TEST_DB;
process.env.NODE_ENV = 'test';

// export paths so tests can clean up
module.exports = {
  TEST_DB_PATH: path.join(__dirname, '..', 'database', TEST_DB),
  TEST_DB_FILENAME: TEST_DB
};
