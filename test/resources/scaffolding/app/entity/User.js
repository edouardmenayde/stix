module.exports = class User {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
  }
};
