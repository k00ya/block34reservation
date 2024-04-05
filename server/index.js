const {
  initializeDatabase, // Renamed from createTables for clarity
  client,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./database");
const express = require("express");
const app = express();

//Middleware
app.use(express.json());

// REST API Routes

// Create a new customer
app.post("/api/customers", async (req, res, next) => {
  try {
    const { name } = req.body; // Extract the name from the request body
    if (!name) {
      return res.status(400).json({ error: "Name is required" }); // Basic validation
    }
    const customer = await createCustomer(name);
    res.status(201).json(customer); // Respond with the created customer record
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new restaurant
app.post("/api/restaurants", async (req, res, next) => {
  try {
    const { name } = req.body; // Extract the name from the request body
    if (!name) {
      return res.status(400).json({ error: "Name is required" }); // Basic validation
    }
    const restaurant = await createRestaurant(name);
    res.status(201).json(restaurant); // Respond with the created restaurant record
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all customers
app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await fetchReservations();
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a reservation for a customer
app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { restaurant_id, date, party_count } = req.body;

    // Directly use the customer ID from the request without additional fetch
    const reservation = await createReservation({
      restaurant_id,
      customer_id: id,
      date,
      party_count,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a reservation
app.delete("/api/customers/:customer_id/reservations/:id", async (req, res, next) => {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server and initialize the database
const startServer = async () => {
  try {
    console.log("Starting server initialization...");
    await initializeDatabase(); // Ensure the database is initialized on server start
    console.log("Database initialized.");

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error("Error during server init:", error);
  }
};

startServer().catch(console.error);
