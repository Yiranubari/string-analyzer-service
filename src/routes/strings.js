const express = require("express");
const StringController = require("../controllers/stringController");

const router = express.Router();

// POST /strings - Create/Analyze String
router.post("/", StringController.createString);

// GET /strings/:string_value - Get Specific String
router.get("/:string_value", StringController.getString);

// GET /strings - Get All Strings with Filtering
router.get("/", StringController.getAllStrings);

// GET /strings/filter-by-natural-language - Natural Language Filtering
router.get(
  "/filter-by-natural-language",
  StringController.filterByNaturalLanguage
);

// DELETE /strings/:string_value - Delete String
router.delete("/:string_value", StringController.deleteString);

module.exports = router;
