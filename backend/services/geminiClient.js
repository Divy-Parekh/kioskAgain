const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractLiquorsFromText(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
You are a helpful assistant that specializes in liquor identification.
From the input text, identify only the liquors explicitly mentioned by the user.
Fix spelling, and respond only in JSON with this format:
{ "cleanText": "...", "liquors": ["Tequila", ...] }.
User: "${userText}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // ✅ Remove triple backticks and any leading/trailing code markers
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(text);
}

async function suggestLiquorsFromMood(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a helpful assistant that recommends liquors based on user mood or feelings.
From the input, extract a short mood summary, and suggest 2–5 suitable liquors.
Respond strictly in JSON format like this:
{ "moodSummary": "Short summary here", "suggestedLiquors": ["Vodka", "Rum", ...] }

User mood: "${userText}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // Clean up response
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(text);
}

async function getCocktailRecipe(drinkName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a professional mixologist.
If the user query is not about a cocktail or drink, respond with:
{
  "error": "Invalid request"
}
Else
Provide a short recipe for the cocktail: "${drinkName}".
Output strictly in JSON format with:
{
  "drink": "Mango Margarita",
  "ingredients": [
    { "item": "Tequila", "amount": "2 oz" },
    { "item": "Mango puree", "amount": "1.5 oz" },
    { "item": "Lime juice", "amount": "1 oz" },
    { "item": "Triple Sec", "amount": "0.5 oz" }
  ],
  "instructions": [
    "Add all ingredients into a shaker with ice",
    "Shake well and strain into a glass",
    "Garnish with lime or mango slice"
  ]
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // Cleanup any backticks or code fences
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(text);
}
async function getLiquorInfoFromGemini(liquorName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a liquor expert.

If the user query is not about a liquor, respond with:
{
  "error": "Invalid request"
}

If the query is about a liquor, return concise information about: "\${liquorName}".

Rules:
- Respond ONLY in JSON
- Do not include explanations, markdown, or text outside the JSON
- Keep values short and factual
- Only respond to liquor-related queries

JSON schema:
{
  "Name": "string",
  "Type": "string",
  "Alcohol_Content": "string",
  "Country": "string",
  "Flavor": "string",
  "Age": "string",
  "Best_For": "string"
}
`;


  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // Clean up any stray code blocks
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini liquor info:", text);
    throw new Error("Invalid JSON returned from Gemini");
  }

  return parsed;
}

module.exports = {
  extractLiquorsFromText,
  suggestLiquorsFromMood,
  getCocktailRecipe,
  getLiquorInfoFromGemini, // ✅ new export
};
