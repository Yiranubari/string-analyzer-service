const crypto = require("crypto");

class StringAnalyzer {
  static analyze(stringValue) {
    if (typeof stringValue !== "string") {
      throw new Error("Input must be a string");
    }

    const trimmedString = stringValue.trim();
    const length = trimmedString.length;
    const lowerCaseString = trimmedString.toLowerCase();

    // Check if palindrome (case-insensitive, ignore whitespace)
    const cleanedString = lowerCaseString.replace(/\s+/g, "");
    const reversed = cleanedString.split("").reverse().join("");
    const is_palindrome = cleanedString === reversed;

    // Count unique characters
    const uniqueChars = new Set(lowerCaseString.replace(/\s+/g, "")).size;

    // Count words (split by whitespace)
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
        character_frequency_map[char] =
          (character_frequency_map[char] || 0) + 1;
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
}

module.exports = StringAnalyzer;
