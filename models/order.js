// orderModel.js

const mongoose = require('mongoose');

// Define Order Schema
const orderSchema = new mongoose.Schema({
    tableNumber: String,
    foodItems: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    orderPlacedTime: Date,
    billId: String,
    totalPrice: Number,
    totalItems: Number,
    status: String
},{
    timestamps: true  // This will add createdAt and updatedAt fields
});

// Create Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
