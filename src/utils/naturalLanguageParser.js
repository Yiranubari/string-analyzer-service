class NaturalLanguageParser {
  static parse(query) {
    const lowerQuery = query.toLowerCase();
    const filters = {};

    // Parse palindrome
    if (
      lowerQuery.includes("palindromic") ||
      lowerQuery.includes("palindrome")
    ) {
      filters.is_palindrome = true;
    }

    // Parse word count
    if (lowerQuery.includes("single word")) {
      filters.word_count = 1;
    } else if (
      lowerQuery.includes("two words") ||
      lowerQuery.includes("2 words")
    ) {
      filters.word_count = 2;
    } else if (
      lowerQuery.includes("three words") ||
      lowerQuery.includes("3 words")
    ) {
      filters.word_count = 3;
    }

    // Parse length filters
    const longerMatch = lowerQuery.match(/longer than (\d+) characters?/);
    if (longerMatch) {
      filters.min_length = parseInt(longerMatch[1]) + 1;
    }

    const shorterMatch = lowerQuery.match(/shorter than (\d+) characters?/);
    if (shorterMatch) {
      filters.max_length = parseInt(shorterMatch[1]) - 1;
    }

    // Parse character containment
    const charMatch = lowerQuery.match(
      /contain(s|ing)? (the letter |the character )?([a-zA-Z])/
    );
    if (charMatch) {
      filters.contains_character = charMatch[3].toLowerCase();
    }

    const vowelMatch = lowerQuery.match(/first vowel/);
    if (vowelMatch) {
      filters.contains_character = "a";
    }

    // Validate filters for conflicts
    this.validateFilters(filters);

    return filters;
  }

  static validateFilters(filters) {
    if (
      filters.min_length &&
      filters.max_length &&
      filters.min_length > filters.max_length
    ) {
      throw new Error(
        "Conflicting filters: min_length cannot be greater than max_length"
      );
    }

    if (filters.word_count && filters.word_count < 0) {
      throw new Error("Invalid word_count: must be non-negative");
    }
  }
}

module.exports = NaturalLanguageParser;
