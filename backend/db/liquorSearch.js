const { createClient } = require("@libsql/client");
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
 * Simple Levenshtein distance implementation
 */
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
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

  // Step 1: Fetch all liquors once
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
      return levenshtein(name, term) <= 2 || levenshtein(category, term) <= 2;
    });
  });

  return matches;
}

module.exports = { findLiquors };
