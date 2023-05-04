
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
const pool = require("./db");

app.use(
  cors(corsOptions)
);

app.use(express.json()); //req.body

app.listen(8000, () => {
    console.log("server has started on port 8000");
});

/**
 * Listens for new orders to be placed and adds them to the zrep table in the database
 * @param {Object} req - The request object containing the zrep data
 * @param {number} req.body.zrep_id - The ID of the zrep
 * @param {string} req.body.zrep_items - The items included in the zrep
 * @param {number} req.body.zrep_price - The price of the zrep
 * @param {number} req.body.offset - The offset to be added to the zrep_id
 * @param {Object} res - The response object
 * @returns {void}
 */
app.post("/zrepfill", async (req, res) => { //Listening for new orders to be placed
  try {
      const { zrep_id, zrep_items, zrep_price, offset} = req.body;
      const query = 'INSERT INTO zrep (zrep_id, zrep_items, zrep_price) VALUES ($1, $2, $3);';
      const values = [zrep_id + offset, zrep_items, zrep_price];
      pool.query(query, values);
  } catch (err) {
    console.log("there is an error");
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

/**
 * Listen for new orders to be placed.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {void}
 */
app.post("/orders", async (req, res) => { //Listening for new orders to be placed
    try {
        const { trans_date, trans_dayofweek, sm_name, trans_price, offset} = req.body;
        console.log(sm_name)
        let trans_id = 0
        await pool.query(
            'SELECT MAX(trans_id) FROM transactions;',
            (err, res) => {
              if (err) {
                console.error(err);
              } else {
                trans_id = res.rows[0].max + offset + 1;
                console.log(trans_id)
                const query = 'INSERT INTO transactions (trans_id, trans_date, trans_dayofweek, sm_name, trans_size, trans_price, trans_cost) VALUES ($1, $2, $3, $4, $5, $6, $7)';
                const values = [trans_id, trans_date, trans_dayofweek, sm_name, "small", trans_price, trans_price];
                pool.query(query, values);
              }
            }
        );
        await pool.query(
          'SELECT MAX(zrep_id) FROM zrep;',
          (err, res) => {
            if (err) {
              console.error(err);
            } else {
              xrep_id = res.rows[0].max + offset + 1;
              const query = 'INSERT INTO xrep (xrep_id, xrep_items, xrep_price) VALUES ($1, $2, $3)';
              const values = [xrep_id, sm_name, trans_price];
              pool.query(query, values);
            }
          }
      );
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

/**
 * Listen for added inventory items and add them to the database.
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @throws {Error} If an error occurs while executing the database queries.
 */
app.post("/inventory", async (req, res) => { //Listening for added inventory items
  try {
      console.log(1)
      const {item_quantitylbs, item_name, item_ppp} = req.body;
      await pool.query(
          'SELECT MAX(item_id) FROM items;',
          (err, res) => {
            if (err) {
              console.error(err);
            } else {
              console.log(res.rows[0].max)
              item_id = parseInt(res.rows[0].max) + 1;
              console.log(item_id)
              const query = 'INSERT INTO items (item_id, item_quantitylbs, item_name, item_ppp) VALUES ($1, $2, $3, $4)';
              const values = [item_id, item_quantitylbs, item_name, item_ppp];
              pool.query(query, values);
            }
          }
      );
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});


app.post("/clearX", async (req, res) => { //Listening for added inventory items
  try {
    
  await pool.query(
    'SELECT COUNT(*) FROM xrep;',
    (err, res) => {
      if (err) {
        console.error(err);
      } else {
        const query = 'TRUNCATE TABLE xrep;';
        pool.query(query);
      }
    }
  )
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});


app.post("/employees", async (req, res) => { //Listening for added inventory items
  try {
      console.log(1)
      const {emp_name, emp_hours, emp_startday, shift_id} = req.body;
      const query = 'INSERT INTO employee (emp_name, emp_hours, emp_startday, shift_id) VALUES ($1, $2, $3, $4)';
      const values = [emp_name, emp_hours, emp_startday, shift_id];
      pool.query(query, values);
    
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

/**
 * Handles a POST request to clear the xrep table.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */


app.post("/oauth", async (req, res) => {
    const {emailText, passwordText} = req.body
    const user = await pool.query('SELECT * FROM oauth WHERE oauth_email = $1 AND oauth_pass = $2', [emailText, passwordText], );
    res.json(user.rows)
});

/**
 * Handles the increment of the quantity of a specific item in the inventory.
 * @async
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {string} req.params.item_id - The ID of the item to increment.
 * @param {number} req.body.val - The value to increment the item quantity by.
 * @returns {Promise<void>} - A Promise that resolves when the item quantity is successfully incremented.
 */
app.post("/inventory/:item_id", async (req, res) => { //Listening to increment inventory items
  try {
      const {item_id, val} = req.body
      await pool.query(
        `UPDATE items SET item_quantitylbs = item_quantitylbs + $1 WHERE item_id = $2`, [val, item_id],
          (err, res) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Incremented successfully")
            }
          }
      );
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

/**
 * Deletes an inventory item with the specified item_id from the database.
 *
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {string} req.body.item_id - The id of the item to be deleted
 * @returns {undefined}
 */
app.delete("/inventory", async (req, res) => { //Listening for deleted inventory items
  try {
      const {item_id} = req.body
      await pool.query(
          'DELETE FROM items WHERE item_id = $1', [item_id], 
          (err, res) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Item deleted successfully")
            }
          }
      );
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.delete("/employees", async (req, res) => { //Listening for deleted inventory items
  try {
      const {emp_name} = req.body
      await pool.query(
          'DELETE FROM employee WHERE emp_name = $1', [emp_name], 
          (err, res) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Item deleted successfully")
            }
          }
      );
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

/**
 * Retrieve all smoothies in the database.
 * Called when the customer and server pages are loaded.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise} Promise object represents the all smoothies retrieved from the database.
 */
app.get("/smoothies", async (req, res) => { //retrieving the smoothies in the database. Called when the customer and server pages are loaded. 
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const allSmoothies = await pool.query("SELECT * FROM smoothies;");
    res.json(allSmoothies.rows);
  } catch (err) {
    console.error("ERROR GETTING SMOOTHIES");
  }
});

/**
 * Retrieves all entries in the xrep table and sends them as a JSON response.
 * This function is called when the customer and server pages are loaded.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 * @throws {Error} - If an error occurs while retrieving the data from the database.
 */
app.get("/xrepfull", async (req, res) => { //retrieving the smoothies in the database. Called when the customer and server pages are loaded. 
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const allSmoothies = await pool.query("SELECT * FROM xrep;");
    res.json(allSmoothies.rows);
  } catch (err) {
    console.error("ERROR GETTING X REPORT");
  }
});

/**
 * Retrieves all data from the 'zrep' table in the database.
 * Called when the customer and server pages are loaded.
 *
 * @function
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The data retrieved from the 'zrep' table in the database.
 * @throws {Error} If there is an error retrieving data from the database.
 */
app.get("/zrepfull", async (req, res) => { //retrieving the smoothies in the database. Called when the customer and server pages are loaded. 
  res.set('Access-Control-Allow-Origin', '*');
  console.log(1)
  try {
    const allSmoothies = await pool.query("SELECT * FROM zrep;");
    res.json(allSmoothies.rows);
  } catch (err) {
    console.error("ERROR GETTING Z REPORT");
  }
});

/**
 * Retrieves inventory information from the database and sends it as a JSON response.
 * This route is used on the manager side to load the inventory data.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} If there is an error retrieving the data.
 * @returns {undefined}
 */
app.get("/inventory", async (req, res) => { //Loading in the inventory, in the manager side
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const allItems = await pool.query("SELECT * FROM items;")
    res.json(allItems.rows);
  } catch (err) {
    console.error("ERROR GETTING ITEMS");
  }
});

/**
 * Retrieves all employees from the database and sends them to the client.
 * Called when the manager page is loaded.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} If there is an error retrieving the employees.
 */
app.get("/employees", async (req, res) => { //Loading in the employee, in the manager side
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const allItems = await pool.query("SELECT * FROM employee;")
    res.json(allItems.rows);
  } catch (err) {
    console.error("ERROR GETTING EMPLOYEES");
  }
});

/**
 * Retrieves all items that need to be restocked from the database.
 * Called when the manager page is loaded.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The HTTP response object containing a JSON array of items that need to be restocked.
 */
app.get("/restock", async (req, res) => { //Loading in the employee, in the manager side
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const allItems = await pool.query("SELECT * FROM items WHERE item_quantitylbs < $1;", [40])
    res.json(allItems.rows);
  } catch (err) {
    console.error("ERROR GETTING RESTOCK");
  }
});

/**
 * Retrieves data on the percentage of excess ingredients used by each smoothie maker during a specified time period.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing start and end dates.
 * @param {string} req.body.startDate - Start date of time period in format YYYY-MM-DD.
 * @param {string} req.body.endDate - End date of time period in format YYYY-MM-DD.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - Promise object representing the result of the database query. Resolves with an object containing data on the percentage of excess ingredients used by each smoothie maker during the specified time period.
 * @throws {Error} - Throws an error if there is an issue with the database query.
 */
app.post("/excess", async (req, res) => { //Loading in the employee, in the manager side
  res.set('Access-Control-Allow-Origin', '*');
  const {startDate, endDate} = req.body
  try {
    const allItems = await pool.query("SELECT sm_name, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percent FROM transactions WHERE trans_date >= $1 AND trans_date <= $2 GROUP BY sm_name ORDER BY percent DESC;", [startDate, endDate])
    res.json(allItems.rows);
  } catch (err) {
    console.error("ERROR GETTING RESTOCK");
  }
});

/**
 * Retrieves sales report data based on a date range and type.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.startDate - The start date of the date range.
 * @param {string} req.body.endDate - The end date of the date range.
 * @param {string} req.body.type - The type of report to generate.
 * @param {Object} res - The response object.
 * @returns {Object[]} An array of objects representing sales report data.
 * @throws {Error} Throws an error if there was an issue retrieving the data.
 */
app.post("/salesreport", async (req, res) => { //Loading in the employee, in the manager side
  res.set('Access-Control-Allow-Origin', '*');
  const {startDate, endDate, type} = req.body
  console.log(startDate)

  let allItems = null
  console.log(type)

  if (Number(type)==1) {
    allItems = await pool.query("SELECT sm_name, COUNT(*) as count FROM transactions WHERE trans_date >= $1 AND trans_date <= $2 GROUP BY sm_name ORDER BY count DESC;", 
    [startDate, endDate]);
  } else {
    allItems = await pool.query("SELECT sm_name, COUNT(*) as count FROM transactions WHERE trans_date >= $1 AND trans_date <= $2 GROUP BY sm_name ORDER BY count ASC;", 
    [startDate, endDate]);
  }
  res.json(allItems.rows); 
});





