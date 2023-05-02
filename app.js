// const express = require("express");
// const cors = require("cors");

// const app = express();
// const pool = require("./db")

// app.use(express.json())
// app.use(cors())

// // testing
// // app.get("/", (req, res) => res.send("Hello"));
// // app.listen(port=5432, () => console.log("Example app listening."));

// app.post("/orders", async (req, res) => {
//     try {
//         const { trans_date, trans_dayofweek, sm_name, trans_price} = req.body;
//         const query = 'INSERT INTO transactions (trans_date, trans_dayofweek, sm_name, trans_size, trans_price, trans_cost) VALUES ($1, $2, $3, $4, $5, $6)';
//         const values = [trans_date, trans_dayofweek, sm_name, "small", trans_price, trans_price];
//         await pool.query(query, values);
//         res.status(200).send('Transaction added successfully');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// });

const pool = require('./db');

const getSmoothies = (request, response) => {
  pool.query('SELECT * FROM smoothies', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getItemByID = (request, response) => {
  const pin = request.query.item_id;

  pool.query('SELECT * FROM items WHERE item_id = ', [pin], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
module.exports = {
    getSmoothies,
    getItemByID,
};