const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {
    async createOrder(userId, orderData) {
        const { items, shippingAddress } = orderData;

        if (!items || items.length === 0) {
            throw new Error('No hay artículos en el pedido');
        }

        let total = 0;
        const orderItems = [];

        // Validate stock and calculate total from DB prices
        for (const item of items) {
            const product = await productRepository.findById(item.product);
            if (!product) {
                throw new Error(`Producto no encontrado: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}`);
            }

            // Decrease stock
            // Decrease stock
            // Use update to avoid full document validation (legacy data issues with category)
            await productRepository.update(product._id, { stock: product.stock - item.quantity });

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                store: product.store,
            });

            total += product.price * item.quantity;
        }

        const order = await orderRepository.create({
            user: userId,
            items: orderItems,
            total,
            shippingAddress,
            status: 'PAID', // Mock payment success
            paymentResult: {
                id: `mock_payment_${Date.now()}`,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                email_address: 'mock@example.com',
            },
        });

        return order;
    }

    async getMyOrders(userId) {
        return await orderRepository.findByUser(userId);
    }

    async getOrdersByStore(userId) {
        const storeRepository = require('../repositories/storeRepository');
        const store = await storeRepository.findByOwner(userId);
        if (!store) {
            throw new Error('El usuario no tiene una tienda');
        }
        return await orderRepository.findByStore(store._id);
    }

    async updateOrderStatus(orderId, status, userId) {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        // Add to history
        order.statusHistory.push({
            status,
            updatedBy: userId,
            timestamp: new Date(),
        });
        order.status = status;

        return await order.save();
    }
}

module.exports = new OrderService();
