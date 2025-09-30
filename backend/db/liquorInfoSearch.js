// const { createClient } = require("@libsql/client");
// require("dotenv").config();

// const client = createClient({
//   url: process.env.DATABASE_URL,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });

// /**
//  * Find liquor info by name
//  * @param {string} name - liquor name
//  * @returns {Promise<Object|null>} liquor details or null if not found
//  */
// async function findLiquorInfo(name) {
//   if (!name) return null;

//   const query = `
//     SELECT * FROM Liquor_Info
//     WHERE LOWER(Name) = ?

//   `;

//   const result = await client.execute(query, [name.toLowerCase()]);
//   return result.rows.length > 0 ? result.rows[0] : null;
// }

// module.exports = { findLiquorInfo };

// db/liquorInfoSearch.js
const { createClient } = require("@libsql/client");
require("dotenv").config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Find liquor info by name
 * @param {string} name - liquor name
 * @returns {Promise<Object|null>} liquor details or null if not found
 */
async function findLiquorInfo(name) {
  if (!name) return null;

  const query = `
    SELECT id, name, category, image, aisle, size
    FROM Liquor_Master
    WHERE LOWER(name) = ?
  `;

  const result = await client.execute(query, [name.toLowerCase()]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

module.exports = { findLiquorInfo };
