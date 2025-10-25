const { createClient } = require("@libsql/client");
const levenshtein = require("fast-levenshtein");
require("dotenv").config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Normalize text for fuzzy matching
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .trim();
}

/**
 * Search for liquors by name or type with fuzzy tolerance
 * Handles minor speech-to-text errors (e.g., "mago" for "mango")
 * @param {string[]} terms - list of search terms (liquor names or types)
 * @returns {Promise<Object[]>} matched liquor records
 */
async function findLiquors(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return [];

  const lowerTerms = terms.map((t) => normalize(t));

  // Step 1: Fetch all liquors once (assuming reasonable table size)
  const allLiquors = await client.execute("SELECT * FROM Liquor_Master");
  const rows = allLiquors.rows || [];

  // Step 2: Apply fuzzy filtering in JS
  const matches = rows.filter((liquor) => {
    const name = normalize(liquor.name || "");
    const category = normalize(liquor.category || "");

    return lowerTerms.some((term) => {
      // Direct or partial match
      if (name.includes(term) || category.includes(term)) return true;

      // Levenshtein distance tolerance (1–2 edits allowed)
      const nameDistance = levenshtein.get(name, term);
      const categoryDistance = levenshtein.get(category, term);
      return nameDistance <= 2 || categoryDistance <= 2;
    });
  });

  return matches;
}

module.exports = { findLiquors };
