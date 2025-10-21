cat > (src / server.js) << "EOF";
const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// In-memory storage
const stringsDB = new Map();

// String analysis function
function analyzeString(stringValue) {
  const trimmedString = stringValue.trim();
  const length = trimmedString.length;
  const lowerCaseString = trimmedString.toLowerCase();

  // Check if palindrome
  const cleanedString = lowerCaseString.replace(/\s+/g, "");
  const reversed = cleanedString.split("").reverse().join("");
  const is_palindrome = cleanedString === reversed;

  // Count unique characters
  const uniqueChars = new Set(lowerCaseString.replace(/\s+/g, "")).size;

  // Count words
  const word_count = trimmedString ? trimmedString.split(/\s+/).length : 0;

  // Generate SHA-256 hash
  const sha256_hash = crypto
    .createHash("sha256")
    .update(trimmedString)
    .digest("hex");

  // Character frequency map
  const character_frequency_map = {};
  for (const char of lowerCaseString) {
    if (char !== " ") {
      character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }
  }

  return {
    length,
    is_palindrome,
    unique_characters: uniqueChars,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

// Natural language parser
function parseNaturalLanguage(query) {
  const lowerQuery = query.toLowerCase();
  const filters = {};

  if (lowerQuery.includes("palindromic") || lowerQuery.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  if (lowerQuery.includes("single word")) {
    filters.word_count = 1;
  }

  const longerMatch = lowerQuery.match(/longer than (\d+) characters?/);
  if (longerMatch) {
    filters.min_length = parseInt(longerMatch[1]) + 1;
  }

  const charMatch = lowerQuery.match(
    /contain(s|ing)? (the letter |the character )?([a-zA-Z])/
  );
  if (charMatch) {
    filters.contains_character = charMatch[3].toLowerCase();
  }

  return filters;
}

// 1. POST /strings - Create/Analyze String
app.post("/strings", (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res
        .status(400)
        .json({ error: 'Missing "value" field in request body' });
    }

    if (typeof value !== "string") {
      return res
        .status(422)
        .json({ error: 'Invalid data type for "value" (must be string)' });
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return res.status(400).json({ error: "String value cannot be empty" });
    }

    // Check if string already exists
    const hash = crypto.createHash("sha256").update(trimmedValue).digest("hex");
    if (stringsDB.has(hash)) {
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    // Analyze string
    const properties = analyzeString(trimmedValue);

    // Store in database
    const stringRecord = {
      id: hash,
      value: trimmedValue,
      properties,
      created_at: new Date().toISOString(),
    };

    stringsDB.set(hash, stringRecord);

    res.status(201).json(stringRecord);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. GET /strings/:string_value - Get Specific String
app.get("/strings/:string_value", (req, res) => {
  try {
    const string_value = decodeURIComponent(req.params.string_value);
    const hash = crypto.createHash("sha256").update(string_value).digest("hex");

    const stringRecord = stringsDB.get(hash);

    if (!stringRecord) {
      return res
        .status(404)
        .json({ error: "String does not exist in the system" });
    }

    res.status(200).json(stringRecord);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. GET /strings - Get All Strings with Filtering
app.get("/strings", (req, res) => {
  try {
    const filters = {};
    const allStrings = Array.from(stringsDB.values());

    // Parse query parameters
    if (req.query.is_palindrome !== undefined) {
      filters.is_palindrome = req.query.is_palindrome === "true";
    }

    if (req.query.min_length !== undefined) {
      filters.min_length = parseInt(req.query.min_length);
    }

    if (req.query.max_length !== undefined) {
      filters.max_length = parseInt(req.query.max_length);
    }

    if (req.query.word_count !== undefined) {
      filters.word_count = parseInt(req.query.word_count);
    }

    if (req.query.contains_character !== undefined) {
      filters.contains_character = req.query.contains_character.toLowerCase();
    }

    // Apply filters
    let results = allStrings.filter((item) => {
      if (
        filters.is_palindrome !== undefined &&
        item.properties.is_palindrome !== filters.is_palindrome
      ) {
        return false;
      }
      if (
        filters.min_length !== undefined &&
        item.properties.length < filters.min_length
      ) {
        return false;
      }
      if (
        filters.max_length !== undefined &&
        item.properties.length > filters.max_length
      ) {
        return false;
      }
      if (
        filters.word_count !== undefined &&
        item.properties.word_count !== filters.word_count
      ) {
        return false;
      }
      if (
        filters.contains_character !== undefined &&
        !(filters.contains_character in item.properties.character_frequency_map)
      ) {
        return false;
      }
      return true;
    });

    res.status(200).json({
      data: results,
      count: results.length,
      filters_applied: filters,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. GET /strings/filter-by-natural-language - Natural Language Filtering
app.get("/strings/filter-by-natural-language", (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Missing "query" parameter' });
    }

    const parsedFilters = parseNaturalLanguage(query);
    const allStrings = Array.from(stringsDB.values());

    // Apply filters
    let results = allStrings.filter((item) => {
      if (
        parsedFilters.is_palindrome !== undefined &&
        item.properties.is_palindrome !== parsedFilters.is_palindrome
      ) {
        return false;
      }
      if (
        parsedFilters.word_count !== undefined &&
        item.properties.word_count !== parsedFilters.word_count
      ) {
        return false;
      }
      if (
        parsedFilters.min_length !== undefined &&
        item.properties.length < parsedFilters.min_length
      ) {
        return false;
      }
      if (
        parsedFilters.contains_character !== undefined &&
        !(
          parsedFilters.contains_character in
          item.properties.character_frequency_map
        )
      ) {
        return false;
      }
      return true;
    });

    res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: "Unable to parse natural language query" });
  }
});

// 5. DELETE /strings/:string_value - Delete String
app.delete("/strings/:string_value", (req, res) => {
  try {
    const string_value = decodeURIComponent(req.params.string_value);
    const hash = crypto.createHash("sha256").update(string_value).digest("hex");

    const stringRecord = stringsDB.get(hash);

    if (!stringRecord) {
      return res
        .status(404)
        .json({ error: "String does not exist in the system" });
    }

    stringsDB.delete(hash);
    res.status(204).send();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "String Analyzer Service",
    endpoints: {
      "POST /strings": "Analyze and store a string",
      "GET /strings/:string_value": "Get analyzed string",
      "GET /strings": "Get all strings with filtering",
      "GET /strings/filter-by-natural-language": "Natural language filtering",
      "DELETE /strings/:string_value": "Delete a string",
      "GET /health": "Service health check",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ String Analyzer Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 API root: http://localhost:${PORT}/`);
  console.log(`🚀 Ready to accept requests!`);
});

module.exports = app;
EOF;
