const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: Number,
  category: String,
  name: String,
  description: String,
  price: Number,
  half: Boolean,
  veg: Boolean,
  chefSpecial: Boolean,
  kidsChoice: Boolean,
  combos: Boolean
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
