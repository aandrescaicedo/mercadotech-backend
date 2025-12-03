/**
 * cartController.js - Controlador de Carrito
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con el carrito persistente
 * 
 * Responsabilidades:
 * - Obtener carrito del usuario autenticado
 * - Actualizar carrito completo
 * - Sincronizar carrito local (localStorage) con base de datos
 * - Gestionar merge de items al iniciar sesión
 * 
 * Endpoints expuestos:
 * - GET /api/v1/cart - Obtener mi carrito
 * - PUT /api/v1/cart - Actualizar carrito completo
 * - POST /api/v1/cart/sync - Sincronizar carrito local con BD
 */

const cartService = require('../services/cartService');

class CartController {
    /**
     * Obtener carrito del usuario autenticado
     * 
     * @endpoint GET /api/v1/cart
     * @access Privado
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @returns {200} Cart - Carrito con items populados (product, store)
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Retorna el carrito del usuario desde la base de datos.
     * Si el usuario no tiene carrito aún, retorna { items: [] }.
     * Los productos se populan con información completa.
     * 
     * @example
     * GET /api/v1/cart
     * Headers: { Authorization: "Bearer <token>" }
     * 
     * Response: {
     *   "user": "user_id",
     *   "items": [
     *     {
     *       "product": { ... },
     *       "quantity": 2,
     *       "store": "store_id"
     *     }
     *   ],
     *   "updatedAt": "2024-12-02T..."
     * }
     */
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.user.id);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Actualizar carrito completo
     * 
     * @endpoint PUT /api/v1/cart
     * @access Privado
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @param {Array} req.body.items - Nuevo array de items
     * @param {string} req.body.items[].product - ID del producto
     * @param {number} req.body.items[].quantity - Cantidad
     * @param {string} req.body.items[].store - ID de la tienda
     * 
     * @returns {200} Cart - Carrito actualizado
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Reemplaza completamente el array de items del carrito.
     * Usado por CartContext.updateBackendCart() en cada cambio.
     * Valida que todos los productos existan en la BD.
     * 
     * @example
     * PUT /api/v1/cart
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "items": [
     *     {
     *       "product": "product_id_1",
     *       "quantity": 2,
     *       "store": "store_id_1"
     *     },
     *     {
     *       "product": "product_id_2",
     *       "quantity": 1,
     *       "store": "store_id_2"
     *     }
     *   ]
     * }
     */
    async updateCart(req, res) {
        try {
            const cart = await cartService.updateCart(req.user.id, req.body.items);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Sincronizar carrito local con base de datos
     * 
     * @endpoint POST /api/v1/cart/sync
     * @access Privado
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @param {Array} req.body.items - Items del localStorage
     * 
     * @returns {200} Cart - Carrito sincronizado (merge de local + BD)
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Llamado al iniciar sesión desde CartContext.
     * 
     * Lógica de merge:
     * 1. Obtiene items actuales de la BD
     * 2. Para cada item del localStorage:
     *    - Si existe en BD: suma las cantidades
     *    - Si no existe: lo añade
     * 3. Guarda el resultado en la BD
     * 4. Retorna el carrito unificado
     * 
     * Esto permite que el carrito persista entre dispositivos
     * y que no se pierdan items al iniciar sesión.
     * 
     * @example
     * POST /api/v1/cart/sync
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "items": [
     *     { "product": "pid1", "quantity": 1, "store": "sid1" }
     *   ]
     * }
     */
    async syncCart(req, res) {
        try {
            const cart = await cartService.syncCart(req.user.id, req.body.items);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new CartController();
