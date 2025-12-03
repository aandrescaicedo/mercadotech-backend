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
 * 
 * Casos de Prueba:
 * 1. Crear tienda válida
 * 2. Aprobar tienda pendiente
 * 3. Obtener tiendas por estado
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
     * 
     * Qué prueba:
     * - El servicio puede crear una nueva tienda
     * - Estado inicial es PENDING
     * - Se retorna tienda creada
     * 
     * Dependencias mockeadas:
     * - storeRepository.create: Simula creación en DB
     */
    test('debe crear tienda válida con estado PENDING', async () => {
        // Arrange
        const storeData = {
            name: 'Tienda de Tecnología',
            description: 'Vendemos productos tech',
            owner: 'user123'
        };

        const createdStore = {
            _id: 'store456',
            ...storeData,
            status: 'PENDING'
        };

        storeRepository.create.mockResolvedValue(createdStore);

        // Act
        const result = await storeService.createStore(storeData);

        // Assert
        expect(storeRepository.create).toHaveBeenCalledWith(storeData);
        expect(result.status).toBe('PENDING');
        expect(result._id).toBeDefined();
    });

    /**
     * Test 2: Aprobar Tienda Pendiente
     * 
     * Qué prueba:
     * - El servicio puede aprobar una tienda pendiente
     * - Estado cambia de PENDING a APPROVED
     * 
     * Dependencias mockeadas:
     * - storeRepository.updateStatus: Simula cambio de estado
     */
    test('debe aprobar tienda pendiente', async () => {
        // Arrange
        const storeId = 'store456';
        const pendingStore = {
            _id: storeId,
            name: 'Mi Tienda',
            status: 'PENDING'
        };

        const approvedStore = {
            ...pendingStore,
            status: 'APPROVED'
        };

        storeRepository.updateStatus.mockResolvedValue(approvedStore);

        // Act
        const result = await storeService.approveStore(storeId);

        // Assert
        expect(storeRepository.updateStatus).toHaveBeenCalledWith(storeId, 'APPROVED');
        expect(result.status).toBe('APPROVED');
    });

    /**
     * Test 3: Obtener Tiendas por Estado
     * 
     * Qué prueba:
     * - El servicio puede filtrar tiendas por estado
     * - Retorna solo tiendas del estado especificado
     * 
     * Dependencias mockeadas:
     * - storeRepository.findByStatus: Retorna tiendas filtradas
     */
    test('debe obtener tiendas por estado', async () => {
        // Arrange
        const status = 'APPROVED';
        const approvedStores = [
            {
                _id: 'store1',
                name: 'Tienda 1',
                status: 'APPROVED'
            },
            {
                _id: 'store2',
                name: 'Tienda 2',
                status: 'APPROVED'
            }
        ];

        storeRepository.findByStatus.mockResolvedValue(approvedStores);

        // Act
        const result = await storeService.getStoresByStatus(status);

        // Assert
        expect(storeRepository.findByStatus).toHaveBeenCalledWith(status);
        expect(result).toEqual(approvedStores);
        expect(result.every(store => store.status === 'APPROVED')).toBe(true);
    });
});
