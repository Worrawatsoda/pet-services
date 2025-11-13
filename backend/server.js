const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  // Set the HTTP status code to 200 (OK)
  res.status(200);
  // Send a plain text response to the client
  res.send("Welcome to the root URL of the Server!");
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server is Successfully Running, and App is listening on port " + port);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Soda48681.',
  database: 'pet_service',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

})

app.get('/users', async (req, res) => {

  try {
    const [rows, fields] = await pool.query('SELECT * FROM user'); res.json(rows);
  } catch (error){
    console.log(error.message);
  }
})