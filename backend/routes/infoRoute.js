
// const express = require("express");
// const { findLiquorInfo } = require("../db/liquorInfoSearch");
// const { synthesizeSpeech } = require("../utils/tts");

// const router = express.Router();

// // Helper: Create liquor info message
// function createLiquorInfoMessage(liquor) {
//   const parts = [
//     `Name: ${liquor.Name}`,
//     `Type: ${liquor.Type}`,
//     `Alcohol Content: ${liquor.Alcohol_Content}`,
//     liquor.Country ? `Country: ${liquor.Country}` : null,
//     liquor.Flavor ? `Flavor: ${liquor.Flavor}` : null,
//     liquor.Age ? `Age: ${liquor.Age}` : null,
//     liquor.Best_For ? `Best For: ${liquor.Best_For}` : null,
//   ].filter(Boolean);

//   return parts.join(". ") + ".";
// }

// router.post("/info", async (req, res) => {
//   const { name } = req.body;
//   if (!name) return res.status(400).json({ error: "Liquor name is required" });

//   try {
//     // Step 1: Query liquor info
//     const liquor = await findLiquorInfo(name);

//     // Step 2: Build reply text
//     const replyText = liquor
//       ? createLiquorInfoMessage(liquor)
//       : `Sorry, no information found for "${name}".`;

//     // Step 3: Generate audio + visemes
//     const { visemes, audio } = await synthesizeSpeech(replyText);

//     // Step 4: Return response
//     res.json({
//       name,
//       liquor,
//       replyText,
//       visemes,
//       audio,
//     });
//   } catch (err) {
//     console.error("Error fetching liquor info:", err);
//     res.status(500).json({ error: "Liquor info lookup failed." });
//   }
// });

// module.exports = router;

const express = require("express");
const { synthesizeSpeech } = require("../utils/tts");
const { getLiquorInfoFromGemini } = require("../services/geminiClient");

const router = express.Router();

// Helper: Create liquor info message (works with Gemini JSON too)
function createLiquorInfoMessage(liquor) {
  // const parts = [
  //   `Name: ${liquor.Name}`,
  //   `Type: ${liquor.Type}`,
  //   liquor.Alcohol_Content
  //     ? `Alcohol Content: ${liquor.Alcohol_Content}`
  //     : null,
  //   liquor.Country ? `Country: ${liquor.Country}` : null,
  //   liquor.Flavor ? `Flavor: ${liquor.Flavor}` : null,
  //   liquor.Age ? `Age: ${liquor.Age}` : null,
  //   liquor.Best_For ? `Best For: ${liquor.Best_For}` : null,
  // ].filter(Boolean);

  // return parts.join(". ") + ".";
  return `Information for ${liquor.Name}`;
}

// 🔥 New Gemini-powered info route
router.post("/info-gemini", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Liquor name is required" });

  try {
    // Step 1: Query Gemini for liquor info
    const liquor = await getLiquorInfoFromGemini(name);

    // Step 2: Build reply text
    const replyText = createLiquorInfoMessage(liquor);

    // Step 3: Generate audio + visemes
    const { visemes, audio } = await synthesizeSpeech(replyText);

    // Step 4: Return response
    res.json({
      name,
      liquor,
      replyText,
      visemes,
      audio,
    });
  } catch (err) {
    console.error("Error fetching liquor info from Gemini:", err);
    res.status(500).json({ error: "Liquor info lookup with Gemini failed." });
  }
});

module.exports = router;
