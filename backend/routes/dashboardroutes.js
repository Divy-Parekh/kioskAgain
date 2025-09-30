const express = require("express");
const multer = require("multer");
const { createClient } = require("@libsql/client");
const { uploadFile } = require("../services/storage.service");

const router = express.Router();

const turso = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Add Liquor Master
router.post("/addliquormaster", upload.single("image"), async (req, res) => {
  try {
    const { name, category, Aisle, Size } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const imagekitResponse = await uploadFile(file.buffer, file.originalname);
    const imageUrl = imagekitResponse.url;

    const query = `INSERT INTO Liquor_Master (name, category, image, Aisle, Size) VALUES (?, ?, ?, ?, ?)`;
    await turso.execute({
      sql: query,
      args: [name, category, imageUrl, Aisle, Size],
    });

    res
      .status(201)
      .json({ message: "Liquor Master record added successfully!", imageUrl });
  } catch (error) {
    console.error("Error adding liquor master:", error);
    res.status(500).json({ message: "Failed to add liquor master record." });
  }
});

// Add Liquor Info
router.post("/addliquorinfo", async (req, res) => {
  try {
    const {
      Name,
      Type,
      Alcohol_Content: AlcoholContent,
      Country,
      Flavor,
      Age,
      Best_For: BestFor,
    } = req.body;

    const query = `INSERT INTO Liquor_Info (Name, Type, Alcohol_Content, Country, Flavor, Age, Best_For) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await turso.execute({
      sql: query,
      args: [Name, Type, AlcoholContent, Country, Flavor, Age, BestFor],
    });

    res.status(201).json({ message: "Liquor Info record added successfully!" });
  } catch (error) {
    console.error("Error adding liquor info:", error);
    res.status(500).json({ message: "Failed to add liquor info record." });
  }
});

// Get all Liquor Master data
router.get("/getliquormaster", async (req, res) => {
  try {
    const { rows } = await turso.execute("SELECT * FROM liquor_master");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching liquor master:", error);
    res.status(500).json({ message: "Failed to fetch liquor master data." });
  }
});

// Get all Liquor Info data
router.get("/getliquorinfo", async (req, res) => {
  try {
    const { rows } = await turso.execute("SELECT * FROM liquor_info");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching liquor info:", error);
    res.status(500).json({ message: "Failed to fetch liquor info data." });
  }
});

// Add Liquor Offers
router.post("/addoffer", async (req, res) => {
  try {
    const { category, size, brand, flavors } = req.body;

    if (!category || !size || !brand) {
      return res
        .status(400)
        .json({ message: "category, size, and brand are required." });
    }

    const query = `
      INSERT INTO Liquor_Offers (category, size, brand, flavors)
      VALUES (?, ?, ?, ?)
    `;

    await turso.execute({
      sql: query,
      args: [category, size, brand, flavors || null],
    });

    res.status(201).json({ message: "Liquor Offer added successfully!" });
  } catch (error) {
    console.error("Error adding liquor offer:", error);
    res.status(500).json({ message: "Failed to add liquor offer." });
  }
});

// Get all Liquor Offers
router.get("/getoffers", async (req, res) => {
  try {
    const { rows } = await turso.execute("SELECT * FROM Liquor_Offers");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching liquor offers:", error);
    res.status(500).json({ message: "Failed to fetch liquor offers." });
  }
  
});

module.exports = router;
