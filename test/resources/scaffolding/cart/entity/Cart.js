module.exports = class Cart {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
  }
};
