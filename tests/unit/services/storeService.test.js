/**
 * Tests Unitarios para storeService
 * 
 * Propósito:
 * Verificar la lógica de gestión de tiendas (creación, aprobación, consultas)
 * sin depender de la base de datos real.
 * 
 * Dependencias:
 * - storeService: Servicio de tiendas principal
 * - storeRepository: Mock del repositorio de tiendas
 */

const storeService = require('../../../src/services/storeService');
const storeRepository = require('../../../src/repositories/storeRepository');

jest.mock('../../../src/repositories/storeRepository');

describe('Store Service - Tests Unitarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Crear Tienda Válida
     */
    test('debe crear tienda válida con estado PENDING', async () => {
        const userId = 'user123';
        const storeData = { name: 'Tienda Tech', description: 'Desc' };
        const createdStore = { _id: 'store456', ...storeData, owner: userId, status: 'PENDING' };

        storeRepository.findByOwner.mockResolvedValue(null); // No tiene tienda previa
        storeRepository.create.mockResolvedValue(createdStore);

        const result = await storeService.createStore(userId, storeData);

        expect(storeRepository.findByOwner).toHaveBeenCalledWith(userId);
        expect(storeRepository.create).toHaveBeenCalledWith({ ...storeData, owner: userId });
        expect(result.status).toBe('PENDING');
    });

    /**
     * Test 2: Aprobar Tienda Pendiente
     */
    test('debe aprobar tienda pendiente', async () => {
        const storeId = 'store456';
        const approvedStore = { _id: storeId, status: 'APPROVED' };

        storeRepository.updateStatus.mockResolvedValue(approvedStore);

        const result = await storeService.approveStore(storeId);

        expect(storeRepository.updateStatus).toHaveBeenCalledWith(storeId, 'APPROVED');
        expect(result.status).toBe('APPROVED');
    });

    /**
     * Test 3: Obtener Todas las Tiendas
     */
    test('debe obtener todas las tiendas', async () => {
        const stores = [{ _id: 'store1' }, { _id: 'store2' }];
        storeRepository.findAll.mockResolvedValue(stores);

        const result = await storeService.getAllStores();

        expect(storeRepository.findAll).toHaveBeenCalled();
        expect(result).toEqual(stores);
    });
});
