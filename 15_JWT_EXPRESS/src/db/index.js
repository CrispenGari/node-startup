const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "jwt",
});

module.exports = pool;
