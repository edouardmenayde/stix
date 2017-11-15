module.exports = class Cart {
  setMapping(mapping) {
    mapping.formatProperty('id').primary().increments();
  }
};
