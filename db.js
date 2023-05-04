const Pool = require("pg").Pool;

const pool = new Pool({
    user: "csce315331_team_64_master",
    password:"profbigfoot88",
    host: "csce-315-db.engr.tamu.edu",
    port:5432,
    database: "csce315331_team_64",
});

module.exports = pool;
