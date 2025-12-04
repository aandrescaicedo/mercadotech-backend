/**
 * Tests Unitarios para orderService
 * 
 * Propósito:
 * Verificar la lógica de gestión de pedidos (creación, actualización de estado,
 * descuento de stock) sin depender de la base de datos real.
 * 
 * Dependencias:
 * - orderService: Servicio de pedidos principal
 * - orderRepository: Mock del repositorio de pedidos
 * - productRepository: Mock del repositorio de productos (para stock)
 */

const orderService = require('../../../src/services/orderService');
const orderRepository = require('../../../src/repositories/orderRepository');
const productRepository = require('../../../src/repositories/productRepository');

jest.mock('../../../src/repositories/orderRepository');
jest.mock('../../../src/repositories/productRepository');

describe('OrderService - Tests Unitarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Crear Pedido Válido con Stock Suficiente
     */
    test('debe crear pedido válido con stock suficiente', async () => {
        const userId = 'user123';
        const orderData = {
            items: [
                { product: 'prod1', quantity: 2, price: 100 },
                { product: 'prod2', quantity: 1, price: 200 }
            ],
            shippingAddress: 'Calle 123'
        };

        const product1 = { _id: 'prod1', name: 'P1', stock: 10, price: 100, store: 'store1' };
        const product2 = { _id: 'prod2', name: 'P2', stock: 5, price: 200, store: 'store1' };

        const createdOrder = { _id: 'order123', user: userId, total: 400, status: 'PAID' };

        productRepository.findById
            .mockResolvedValueOnce(product1)
            .mockResolvedValueOnce(product2);
        productRepository.update.mockResolvedValue(true);
        orderRepository.create.mockResolvedValue(createdOrder);

        const result = await orderService.createOrder(userId, orderData);

        expect(productRepository.findById).toHaveBeenCalledTimes(2);
        expect(productRepository.update).toHaveBeenCalledWith('prod1', { stock: 8 });
        expect(productRepository.update).toHaveBeenCalledWith('prod2', { stock: 4 });
        expect(orderRepository.create).toHaveBeenCalled();
        expect(result.total).toBe(400);
    });

    /**
     * Test 2: Rechazar Pedido sin Stock Suficiente
     */
    test('debe rechazar pedido sin stock suficiente', async () => {
        const userId = 'user123';
        const orderData = {
            items: [{ product: 'prod1', quantity: 15 }]
        };

        const product = { _id: 'prod1', name: 'P1', stock: 10, price: 100 };
        productRepository.findById.mockResolvedValue(product);

        await expect(
            orderService.createOrder(userId, orderData)
        ).rejects.toThrow(/stock insuficiente/i);

        expect(orderRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Test 3: Actualizar Estado de Pedido
     */
    test('debe actualizar estado de pedido', async () => {
        const userId = 'user123';
        const orderId = 'order123';
        const newStatus = 'CONFIRMED';

        const existingOrder = {
            _id: orderId,
            status: 'PENDING',
            user: userId,
            statusHistory: [],
            save: jest.fn().mockResolvedValue({ status: newStatus })
        };

        orderRepository.findById.mockResolvedValue(existingOrder);

        const result = await orderService.updateOrderStatus(orderId, newStatus, userId);

        expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
        expect(existingOrder.status).toBe(newStatus);
        expect(existingOrder.statusHistory).toHaveLength(1);
        expect(existingOrder.save).toHaveBeenCalled();
        expect(result.status).toBe(newStatus);
    });

    /**
     * Test 4: Obtener Pedidos por Usuario
     */
    test('debe obtener pedidos por usuario', async () => {
        const userId = 'user123';
        const userOrders = [{ _id: 'order1' }, { _id: 'order2' }];

        orderRepository.findByUser.mockResolvedValue(userOrders);

        const result = await orderService.getMyOrders(userId);

        expect(orderRepository.findByUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(userOrders);
    });
});
