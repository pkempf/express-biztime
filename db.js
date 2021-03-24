/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

/** for some reason in the sample code this was "NODE_ENF" instead of
 *  "NODE_ENV" but I'm pretty sure that's wrong */
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime-test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({ connectionString: DB_URI });

db.connect();

module.exports = db;
