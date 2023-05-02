const Pool = require("pg").Pool;

const pool = new Pool({
    user: "csce315331_team_64_master",
    password:"profbigfoot88",
    host: "csce-315-db.engr.tamu.edu",
    port:5432,
    database: "csce315331_team_64",
});

module.exports = pool;

// change later
// const Pool = require('pg').Pool;
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// module.exports = pool;