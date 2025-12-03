const storeRepository = require('../repositories/storeRepository');

class StoreService {
    async createStore(userId, storeData) {
        const existingStore = await storeRepository.findByOwner(userId);
        if (existingStore) {
            throw new Error('El usuario ya tiene una tienda');
        }

        return await storeRepository.create({ ...storeData, owner: userId });
    }

    async getMyStore(userId) {
        return await storeRepository.findByOwner(userId);
    }

    async getStoreById(id) {
        return await storeRepository.findById(id);
    }

    async getAllStores() {
        return await storeRepository.findAll();
    }

    async approveStore(storeId) {
        return await storeRepository.updateStatus(storeId, 'APPROVED');
    }

    async updateStore(userId, updateData) {
        const store = await storeRepository.findByOwner(userId);
        if (!store) {
            throw new Error('Tienda no encontrada');
        }
        return await storeRepository.update(store._id, updateData);
    }
}

module.exports = new StoreService();
