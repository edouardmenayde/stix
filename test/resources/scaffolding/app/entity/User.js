module.exports = class User {
  setMapping(mapping) {
    mapping.forProperty('id').primary().increments();
  }
};
