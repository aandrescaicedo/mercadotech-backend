const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');

class CartService {
    async getCart(userId) {
        let cart = await cartRepository.findByUser(userId);
        if (!cart) {
            return { items: [] };
        }
        return cart;
    }

    async updateCart(userId, items) {
        // Validate products exist
        for (const item of items) {
            const product = await productRepository.findById(item.product);
            if (!product) {
                throw new Error(`Producto no encontrado: ${item.product}`);
            }
        }
        return await cartRepository.update(userId, items);
    }

    async syncCart(userId, localItems) {
        let cart = await cartRepository.findByUser(userId);
        let dbItems = cart ? cart.items : [];

        // Merge logic: Add local items to DB items
        for (const localItem of localItems) {
            const existingItemIndex = dbItems.findIndex(
                (dbItem) => dbItem.product._id.toString() === localItem.product
            );

            if (existingItemIndex > -1) {
                // Update quantity if exists
                dbItems[existingItemIndex].quantity += localItem.quantity;
            } else {
                // Add new item
                dbItems.push({
                    product: localItem.product,
                    quantity: localItem.quantity,
                    store: localItem.store
                });
            }
        }

        return await this.updateCart(userId, dbItems);
    }
}

module.exports = new CartService();
