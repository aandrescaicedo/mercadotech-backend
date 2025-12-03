const Store = require('../models/Store');

class StoreRepository {
    async create(storeData) {
        const store = new Store(storeData);
        return await store.save();
    }

    async findByOwner(ownerId) {
        return await Store.findOne({ owner: ownerId });
    }

    async findById(id) {
        return await Store.findById(id);
    }

    async findAll() {
        return await Store.find(); // For admin or listing
    }

    async updateStatus(id, status) {
        return await Store.findByIdAndUpdate(id, { status }, { new: true });
    }

    async update(id, updateData) {
        return await Store.findByIdAndUpdate(id, updateData, { new: true });
    }
}

module.exports = new StoreRepository();
