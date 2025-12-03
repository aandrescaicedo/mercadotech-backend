const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
    async createCategory(categoryData) {
        return await categoryRepository.create(categoryData);
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        return await categoryRepository.findById(id);
    }

    async updateCategory(id, updateData) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        return await categoryRepository.update(id, updateData);
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        return await categoryRepository.delete(id);
    }
}

module.exports = new CategoryService();
