const productRepository = require('../repositories/productRepository');
const storeRepository = require('../repositories/storeRepository');

class ProductService {
    async createProduct(userId, productData) {
        const store = await storeRepository.findByOwner(userId);
        if (!store) {
            throw new Error('El usuario no tiene una tienda');
        }
        if (store.status !== 'APPROVED') {
            throw new Error('La tienda aún no ha sido aprobada');
        }

        return await productRepository.create({ ...productData, store: store._id });
    }

    async getProductsByStore(storeId) {
        return await productRepository.findByStore(storeId);
    }

    async getAllProducts(filters) {
        return await productRepository.findAll(filters);
    }

    // New method to retrieve a product by its ID
    async getProductById(productId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async updateProduct(userId, productId, updateData) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const store = await storeRepository.findByOwner(userId);
        if (!store || store._id.toString() !== product.store.toString()) {
            throw new Error('No autorizado para actualizar este producto');
        }

        return await productRepository.update(productId, updateData);
    }

    async deleteProduct(userId, productId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const store = await storeRepository.findByOwner(userId);
        if (!store || store._id.toString() !== product.store.toString()) {
            throw new Error('No autorizado para eliminar este producto');
        }

        return await productRepository.delete(productId);
    }
}

module.exports = new ProductService();
