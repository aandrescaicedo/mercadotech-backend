const Product = require('../models/Product');

class ProductRepository {
    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async findByStore(storeId) {
        return await Product.find({ store: storeId });
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async findAll(filters = {}) {
        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
        }

        return await Product.find(query).populate('store', 'name');
    }

    async update(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }
}

module.exports = new ProductRepository();
