class StringModel {
  constructor() {
    this.strings = new Map(); // Using Map for O(1) lookups
  }

  create(stringValue, properties) {
    const id = properties.sha256_hash;
    const stringRecord = {
      id,
      value: stringValue,
      properties,
      created_at: new Date().toISOString(),
    };

    this.strings.set(id, stringRecord);
    return stringRecord;
  }

  findById(id) {
    return this.strings.get(id);
  }

  findByValue(stringValue) {
    const hash = require("crypto")
      .createHash("sha256")
      .update(stringValue.trim())
      .digest("hex");

    return this.strings.get(hash);
  }

  findAll(filters = {}) {
    let results = Array.from(this.strings.values());

    if (filters.is_palindrome !== undefined) {
      results = results.filter(
        (item) => item.properties.is_palindrome === filters.is_palindrome
      );
    }

    if (filters.min_length !== undefined) {
      results = results.filter(
        (item) => item.properties.length >= filters.min_length
      );
    }

    if (filters.max_length !== undefined) {
      results = results.filter(
        (item) => item.properties.length <= filters.max_length
      );
    }

    if (filters.word_count !== undefined) {
      results = results.filter(
        (item) => item.properties.word_count === filters.word_count
      );
    }

    if (filters.contains_character !== undefined) {
      results = results.filter(
        (item) =>
          filters.contains_character.toLowerCase() in
          item.properties.character_frequency_map
      );
    }

    return results;
  }

  deleteById(id) {
    return this.strings.delete(id);
  }

  exists(id) {
    return this.strings.has(id);
  }

  count() {
    return this.strings.size;
  }
}

module.exports = new StringModel();
