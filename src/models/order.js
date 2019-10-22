const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    products: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }
    ]
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
