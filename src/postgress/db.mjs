import mysql from 'mysql2/promise';

// Maak een MySQL connectiepool
const pool = mysql.createPool({
  user: 'jurgen',
  password: 'jp.@8SQ7?',
  host: 'localhost',
  port: 3306, // default Postgres port
  database: 'api'
});

export default pool;



