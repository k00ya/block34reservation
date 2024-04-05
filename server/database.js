require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid'); // Import the uuid function

// Database Connection Setup
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  // For development, might not need SSL or set rejectUnauthorized to false.
  // For production, ensure appropriate SSL settings for secure connections.
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
};

const client = new Client(databaseConfig);

client.connect()
  .then(() => console.log('Database connection established.'))
  .catch(error => console.error('Database connection error:', error));

// Database Initialization: Tables and Seed Data
async function initializeDatabase() {
  await client.query(`
    DROP TABLE IF EXISTS reservations, customers, restaurants;

    CREATE TABLE customers (
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE restaurants (
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE reservations (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id),
      customer_id UUID REFERENCES customers(id)
    );
  `);
  console.log("Database initialized with tables.");
}

// Customer Operations
async function createCustomer(name) {
  const id = uuidv4(); // Generate UUID here
  return (await client.query(`INSERT INTO customers (id, name) VALUES ($1, $2) RETURNING *`, [id, name])).rows[0];
}

async function fetchCustomers() {
  return (await client.query('SELECT * FROM customers')).rows;
}

// Restaurant Operations
async function createRestaurant(name) {
  const id = uuidv4(); // Generate UUID here
  return (await client.query(`INSERT INTO restaurants (id, name) VALUES ($1, $2) RETURNING *`, [id, name])).rows[0];
}

async function fetchRestaurants() {
  return (await client.query('SELECT * FROM restaurants')).rows;
}

// Reservation Operations
async function createReservation({ restaurant_id, customer_id, date, party_count }) {
  const id = uuidv4(); // Generate UUID here
  return (await client.query(`INSERT INTO reservations (id, restaurant_id, customer_id, date, party_count) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id, restaurant_id, customer_id, date, party_count])).rows[0];
}

async function fetchReservations() {
  return (await client.query('SELECT * FROM reservations')).rows;
}

async function destroyReservation(id) {
  await client.query(`DELETE FROM reservations WHERE id = $1`, [id]);
}

module.exports = {
  initializeDatabase,
  client,
  createCustomer,
  fetchCustomers,
  createRestaurant,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
};
