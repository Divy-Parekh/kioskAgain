
const express = require("express");
const { getCocktailRecipe } = require("../services/geminiClient");
const { synthesizeSpeech } = require("../utils/tts");

const router = express.Router();

router.post("/suggest", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Drink name is required" });

  try {
    // Step 1: Get recipe from AI
    const recipe = await getCocktailRecipe(text);

    // Step 2: Build reply message (short)
    // const replyText = `Here’s a quick recipe for ${
    //   recipe.drink
    // }: ${recipe.ingredients
    //   .map((ing) => `${ing.amount} ${ing.item}`)
    //   .join(", ")}. Steps: ${recipe.instructions.join(" ")}.`;
    const replyText = `Here’s a quick recipe for ${
      recipe.drink
    }`;
    

    // Step 3: Generate audio + viseme data
    const { visemes, audio } = await synthesizeSpeech(replyText);

    // Step 4: Send full recipe + audio
    res.json({
      recipe,
      replyText,
      visemes,
      audio,
    });
  } catch (err) {
    console.error("Error generating cocktail recipe:", err);
    res.status(500).json({ error: "Failed to generate recipe." });
  }
});

module.exports = router;
