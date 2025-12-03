const Category = require('../models/Category');

class CategoryRepository {
    async create(categoryData) {
        const category = new Category(categoryData);
        return await category.save();
    }

    async findAll() {
        return await Category.find().sort({ name: 1 });
    }

    async findById(id) {
        return await Category.findById(id);
    }

    async update(id, updateData) {
        return await Category.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }
}

module.exports = new CategoryRepository();
