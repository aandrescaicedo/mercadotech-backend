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
 * 
 * Casos de Prueba:
 * 1. Crear pedido válido con stock suficiente
 * 2. Rechazar pedido sin stock suficiente
 * 3. Actualizar estado de pedido
 * 4. Obtener pedidos por usuario
 * 5. Verificar descuento de stock después de crear orden
 */

const orderService = require('../../src/services/orderService');
const orderRepository = require('../../src/repositories/orderRepository');
const productRepository = require('../../src/repositories/productRepository');

jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/productRepository');

describe('OrderService - Tests Unitarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Crear Pedido Válido con Stock Suficiente
     * 
     * Qué prueba:
     * - El servicio crea un pedido cuando hay stock disponible
     * - Se actualiza el stock de los productos
     * - Se calculan correctamente los totales
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna productos con stock
     * - productRepository.update: Simula actualización de stock
     * - orderRepository.create: Simula creación del pedido
     */
    test('debe crear pedido válido con stock suficiente', async () => {
        // Arrange
        const orderData = {
            user: 'user123',
            items: [
                { product: 'prod1', quantity: 2, price: 100 },
                { product: 'prod2', quantity: 1, price: 200 }
            ]
        };

        const product1 = {
            _id: 'prod1',
            name: 'Producto 1',
            stock: 10,
            price: 100
        };

        const product2 = {
            _id: 'prod2',
            name: 'Producto 2',
            stock: 5,
            price: 200
        };

        const createdOrder = {
            _id: 'order123',
            ...orderData,
            total: 400, // (2 * 100) + (1 * 200)
            status: 'PENDING'
        };

        productRepository.findById
            .mockResolvedValueOnce(product1)
            .mockResolvedValueOnce(product2);
        productRepository.update.mockResolvedValue(true);
        orderRepository.create.mockResolvedValue(createdOrder);

        // Act
        const result = await orderService.createOrder(orderData);

        // Assert
        expect(productRepository.findById).toHaveBeenCalledTimes(2);
        expect(productRepository.update).toHaveBeenCalledWith('prod1', { stock: 8 }); // 10 - 2
        expect(productRepository.update).toHaveBeenCalledWith('prod2', { stock: 4 }); // 5 - 1
        expect(orderRepository.create).toHaveBeenCalled();
        expect(result.total).toBe(400);
    });

    /**
     * Test 2: Rechazar Pedido sin Stock Suficiente
     * 
     * Qué prueba:
     * - El servicio rechaza pedidos cuando no hay stock disponible
     * - No se crea el pedido
     * - Se lanza error informativo
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna producto con stock insuficiente
     */
    test('debe rechazar pedido sin stock suficiente', async () => {
        // Arrange
        const orderData = {
            user: 'user123',
            items: [
                { product: 'prod1', quantity: 15, price: 100 } // Solicitando más que el stock
            ]
        };

        const product = {
            _id: 'prod1',
            name: 'Producto 1',
            stock: 10, // Solo hay 10
            price: 100
        };

        productRepository.findById.mockResolvedValue(product);

        // Act & Assert
        await expect(
            orderService.createOrder(orderData)
        ).rejects.toThrow(/stock insuficiente/i);

        expect(orderRepository.create).not.toHaveBeenCalled();
        expect(productRepository.update).not.toHaveBeenCalled();
    });

    /**
     * Test 3: Actualizar Estado de Pedido
     * 
     * Qué prueba:
     * - El servicio puede actualizar el estado de un pedido
     * - Estados válidos: PENDING, CONFIRMED, DELIVERED, CANCELLED
     * 
     * Dependencias mockeadas:
     * - orderRepository.findById: Retorna pedido existente
     * - orderRepository.update: Simula actualización
     */
    test('debe actualizar estado de pedido', async () => {
        // Arrange
        const orderId = 'order123';
        const newStatus = 'CONFIRMED';

        const existingOrder = {
            _id: orderId,
            status: 'PENDING',
            user: 'user123'
        };

        const updatedOrder = {
            ...existingOrder,
            status: newStatus
        };

        orderRepository.findById.mockResolvedValue(existingOrder);
        orderRepository.update.mockResolvedValue(updatedOrder);

        // Act
        const result = await orderService.updateOrderStatus(orderId, newStatus);

        // Assert
        expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
        expect(orderRepository.update).toHaveBeenCalledWith(orderId, { status: newStatus });
        expect(result.status).toBe(newStatus);
    });

    /**
     * Test 4: Obtener Pedidos por Usuario
     * 
     * Qué prueba:
     * - El servicio puede obtener todos los pedidos de un usuario
     * - Retorna array de pedidos
     * 
     * Dependencias mockeadas:
     * - orderRepository.findByUser: Retorna pedidos del usuario
     */
    test('debe obtener pedidos por usuario', async () => {
        // Arrange
        const userId = 'user123';
        const userOrders = [
            {
                _id: 'order1',
                user: userId,
                total: 100,
                status: 'DELIVERED'
            },
            {
                _id: 'order2',
                user: userId,
                total: 250,
                status: 'PENDING'
            }
        ];

        orderRepository.findByUser.mockResolvedValue(userOrders);

        // Act
        const result = await orderService.getOrdersByUser(userId);

        // Assert
        expect(orderRepository.findByUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(userOrders);
        expect(result).toHaveLength(2);
    });

    /**
     * Test 5: Verificar Descuento de Stock Correcto
     * 
     * Qué prueba:
     * - El stock se descuenta correctamente para múltiples productos
     * - Los cálculos son precisos
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna productos
     * - productRepository.update: Verifica cálculos
     */
    test('debe descontar stock correctamente para múltiples productos', async () => {
        // Arrange
        const orderData = {
            user: 'user123',
            items: [
                { product: 'prod1', quantity: 3, price: 50 },
                { product: 'prod2', quantity: 5, price: 30 },
                { product: 'prod3', quantity: 1, price: 100 }
            ]
        };

        const products = [
            { _id: 'prod1', stock: 20, price: 50 },
            { _id: 'prod2', stock: 15, price: 30 },
            { _id: 'prod3', stock: 10, price: 100 }
        ];

        productRepository.findById
            .mockResolvedValueOnce(products[0])
            .mockResolvedValueOnce(products[1])
            .mockResolvedValueOnce(products[2]);
        productRepository.update.mockResolvedValue(true);
        orderRepository.create.mockResolvedValue({ _id: 'order123' });

        // Act
        await orderService.createOrder(orderData);

        // Assert
        expect(productRepository.update).toHaveBeenCalledWith('prod1', { stock: 17 }); // 20 - 3
        expect(productRepository.update).toHaveBeenCalledWith('prod2', { stock: 10 }); // 15 - 5
        expect(productRepository.update).toHaveBeenCalledWith('prod3', { stock: 9 });  // 10 - 1
    });
});
