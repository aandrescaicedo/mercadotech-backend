const Order = require('../models/Order');

class OrderRepository {
    async create(orderData) {
        const order = new Order(orderData);
        return await order.save();
    }

    async findByUser(userId) {
        return await Order.find({ user: userId }).sort({ createdAt: -1 });
    }

    async findById(id) {
        return await Order.findById(id).populate('user', 'email').populate('items.product');
    }

    async findByStore(storeId) {
        return await Order.find({ 'items.store': storeId })
            .sort({ createdAt: -1 })
            .populate('user', 'email')
            .populate('items.product');
    }

    async update(id, updateData) {
        return await Order.findByIdAndUpdate(id, updateData, { new: true });
    }
}

module.exports = new OrderRepository();
