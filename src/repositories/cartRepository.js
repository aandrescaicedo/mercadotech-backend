const Cart = require('../models/Cart');

class CartRepository {
    async findByUser(userId) {
        return await Cart.findOne({ user: userId }).populate('items.product');
    }

    async create(cartData) {
        const cart = new Cart(cartData);
        return await cart.save();
    }

    async update(userId, items) {
        return await Cart.findOneAndUpdate(
            { user: userId },
            { items, updatedAt: Date.now() },
            { new: true, upsert: true }
        ).populate('items.product');
    }
}

module.exports = new CartRepository();
