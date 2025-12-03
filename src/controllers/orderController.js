/**
 * orderController.js - Controlador de Pedidos
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con pedidos
 * 
 * Responsabilidades:
 * - Gestionar creación de pedidos
 * - Consultar pedidos del usuario o de la tienda
 * - Actualizar estado de pedidos
 * - Manejo de errores y respuestas HTTP
 * 
 * Endpoints expuestos:
 * - POST /api/v1/orders - Crear pedido
 * - GET /api/v1/orders/:id - Obtener pedido (implementado en rutas)
 * - GET /api/v1/orders/store-orders - Pedidos de la tienda
 * - PUT /api/v1/orders/:id/status - Actualizar estado
 */

const orderService = require('../services/orderService');

class OrderController {
    /**
     * Crear nuevo pedido
     * 
     * @endpoint POST /api/v1/orders
     * @access Privado (requiere autenticación)
     * 
     * @param {string} req.user.id - ID del usuario autenticado (del middleware)
     * @param {Object} req.body - Datos del pedido
     * @param {Array} req.body.items - Items del pedido
     * @param {Object} req.body.shippingAddress - Dirección de envío
     * 
     * @returns {201} Order - Pedido creado
     * @returns {400} { message: string } - Error de validación
     * 
     * @example
     * POST /api/v1/orders
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "items": [
     *     { "product": "product_id", "quantity": 2, "store": "store_id" }
     *   ],
     *   "shippingAddress": {
     *     "address": "Calle 123",
     *     "city": "Cali",
     *     "postalCode": "760001",
     *     "country": "Colombia"
     *   }
     * }
     */
    async createOrder(req, res) {
        try {
            const order = await orderService.createOrder(req.user.id, req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Obtener pedidos del usuario autenticado
     * 
     * @endpoint GET /api/v1/orders (implementado en rutas como default)
     * @access Privado
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @returns {200} Order[] - Array de pedidos del usuario
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Retorna todos los pedidos realizados por el usuario logueado.
     * Usado en la página "Mis Pedidos" del cliente.
     */
    async getMyOrders(req, res) {
        try {
            const orders = await orderService.getMyOrders(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtener pedidos de la tienda del usuario
     * 
     * @endpoint GET /api/v1/orders/store-orders
     * @access Privado (rol STORE)
     * 
     * @param {string} req.user.id - ID del dueño de la tienda
     * @returns {200} Order[] - Pedidos que contienen productos de la tienda
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Filtra y retorna pedidos que incluyen al menos un producto de la tienda del usuario.
     * Usado en el tab "Pedidos" del StoreDashboard.
     * 
     * @example
     * GET /api/v1/orders/store-orders
     * Headers: { Authorization: "Bearer <token>" }
     */
    async getOrdersByStore(req, res) {
        try {
            const orders = await orderService.getOrdersByStore(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Actualizar estado de un pedido
     * 
     * @endpoint PUT /api/v1/orders/:id/status
     * @access Privado (rol STORE, solo sus pedidos)
     * 
     * @param {string} req.params.id - ID del pedido
     * @param {string} req.body.status - Nuevo estado
     * @param {string} req.user.id - ID del usuario que actualiza
     * 
     * @returns {200} Order - Pedido actualizado con nuevo statusHistory
     * @returns {400} { message: string } - Error de validación o autorización
     * 
     * @description
     * Permite al dueño de tienda cambiar el estado de pedidos que contengan sus productos.
     * Registra el cambio en statusHistory con timestamp y updatedBy.
     * 
     * Estados válidos: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
     * 
     * @example
     * PUT /api/v1/orders/order_id_123/status
     * Headers: { Authorization: "Bearer <token>" }
     * Body: { "status": "SHIPPED" }
     */
    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await orderService.updateOrderStatus(req.params.id, status, req.user.id);
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
