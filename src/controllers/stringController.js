const StringAnalyzer = require("../utils/stringAnalyzer");
const NaturalLanguageParser = require("../utils/naturalLanguageParser");
const stringModel = require("../models/stringModel");

class StringController {
  static createString(req, res) {
    try {
      const { value } = req.body;

      // Validation
      if (value === undefined) {
        return res.status(400).json({
          error: 'Missing "value" field in request body',
        });
      }

      if (typeof value !== "string") {
        return res.status(422).json({
          error: 'Invalid data type for "value" (must be string)',
        });
      }

      const trimmedValue = value.trim();
      if (trimmedValue.length === 0) {
        return res.status(400).json({
          error: "String value cannot be empty",
        });
      }

      // Check if string already exists
      const existingString = stringModel.findByValue(trimmedValue);
      if (existingString) {
        return res.status(409).json({
          error: "String already exists in the system",
        });
      }

      // Analyze string
      const properties = StringAnalyzer.analyze(trimmedValue);

      // Store in model
      const stringRecord = stringModel.create(trimmedValue, properties);

      res.status(201).json(stringRecord);
    } catch (error) {
      console.error("Error creating string:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static getString(req, res) {
    try {
      const { string_value } = req.params;
      const decodedString = decodeURIComponent(string_value);

      const stringRecord = stringModel.findByValue(decodedString);

      if (!stringRecord) {
        return res.status(404).json({
          error: "String does not exist in the system",
        });
      }

      res.status(200).json(stringRecord);
    } catch (error) {
      console.error("Error getting string:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static getAllStrings(req, res) {
    try {
      const filters = {};

      // Parse query parameters
      if (req.query.is_palindrome !== undefined) {
        filters.is_palindrome = req.query.is_palindrome === "true";
      }

      if (req.query.min_length !== undefined) {
        const minLength = parseInt(req.query.min_length);
        if (isNaN(minLength) || minLength < 0) {
          return res.status(400).json({
            error:
              "Invalid min_length parameter (must be non-negative integer)",
          });
        }
        filters.min_length = minLength;
      }

      if (req.query.max_length !== undefined) {
        const maxLength = parseInt(req.query.max_length);
        if (isNaN(maxLength) || maxLength < 0) {
          return res.status(400).json({
            error:
              "Invalid max_length parameter (must be non-negative integer)",
          });
        }
        filters.max_length = maxLength;
      }

      if (req.query.word_count !== undefined) {
        const wordCount = parseInt(req.query.word_count);
        if (isNaN(wordCount) || wordCount < 0) {
          return res.status(400).json({
            error:
              "Invalid word_count parameter (must be non-negative integer)",
          });
        }
        filters.word_count = wordCount;
      }

      if (req.query.contains_character !== undefined) {
        if (req.query.contains_character.length !== 1) {
          return res.status(400).json({
            error:
              "Invalid contains_character parameter (must be a single character)",
          });
        }
        filters.contains_character = req.query.contains_character.toLowerCase();
      }

      // Apply filters
      const results = stringModel.findAll(filters);

      res.status(200).json({
        data: results,
        count: results.length,
        filters_applied: filters,
      });
    } catch (error) {
      console.error("Error getting all strings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static filterByNaturalLanguage(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          error: 'Missing "query" parameter',
        });
      }

      if (typeof query !== "string") {
        return res.status(400).json({
          error: 'Invalid "query" parameter (must be string)',
        });
      }

      // Parse natural language query
      const parsedFilters = NaturalLanguageParser.parse(query);

      // Apply filters
      const results = stringModel.findAll(parsedFilters);

      res.status(200).json({
        data: results,
        count: results.length,
        interpreted_query: {
          original: query,
          parsed_filters: parsedFilters,
        },
      });
    } catch (error) {
      console.error("Error filtering by natural language:", error);

      if (
        error.message.includes("Conflicting") ||
        error.message.includes("Invalid")
      ) {
        return res.status(422).json({
          error: "Query parsed but resulted in conflicting filters",
        });
      }

      res.status(400).json({
        error: "Unable to parse natural language query",
      });
    }
  }

  static deleteString(req, res) {
    try {
      const { string_value } = req.params;
      const decodedString = decodeURIComponent(string_value);

      const stringRecord = stringModel.findByValue(decodedString);

      if (!stringRecord) {
        return res.status(404).json({
          error: "String does not exist in the system",
        });
      }

      stringModel.deleteById(stringRecord.id);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting string:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = StringController;
