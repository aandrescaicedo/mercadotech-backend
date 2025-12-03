/**
 * storeController.js - Controlador de Tiendas
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con tiendas
 * 
 * Responsabilidades:
 * - Gestionar creación y actualización de tiendas
 * - Consultar tiendas (todas para admin, propia para vendedor)
 * - Aprobar tiendas (solo admin)
 * - Validar permisos y estados
 * 
 * Endpoints expuestos:
 * - POST /api/v1/stores - Crear tienda
 * - GET /api/v1/stores/my-store - Obtener mi tienda
 * - GET /api/v1/stores - Listar todas (admin)
 * - PUT /api/v1/stores/:id/approve - Aprobar tienda (admin)
 * - PUT /api/v1/stores - Actualizar mi tienda
 */

const storeService = require('../services/storeService');

class StoreController {
    /**
     * Crear nueva tienda
     * 
     * @endpoint POST /api/v1/stores
     * @access Privado (rol STORE)
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @param {Object} req.body - Datos de la tienda
     * @param {string} req.body.name - Nombre de la tienda (único)
     * @param {string} req.body.description - Descripción de la tienda
     * 
     * @returns {201} Store - Tienda creada con status PENDING
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Un usuario con rol STORE puede crear una tienda.
     * La tienda se crea con status PENDING y requiere aprobación del admin.
     * Solo puede crear una tienda por usuario.
     * 
     * @example
     * POST /api/v1/stores
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "name": "TechStore Colombia",
     *   "description": "Tienda de tecnología y electrónica"
     * }
     */
    async createStore(req, res) {
        try {
            const store = await storeService.createStore(req.user.id, req.body);
            res.status(201).json(store);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Obtener la tienda del usuario autenticado
     * 
     * @endpoint GET /api/v1/stores/my-store
     * @access Privado (rol STORE)
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @returns {200} Store - Tienda del usuario con datos del owner populados
     * @returns {404} { message: "Tienda no encontrada" }
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Retorna la tienda asociada al usuario autenticado.
     * Usado en CreateStorePage para verificar si ya tiene tienda.
     * Usado en StoreDashboardPage para mostrar información de la tienda.
     */
    async getMyStore(req, res) {
        try {
            const store = await storeService.getMyStore(req.user.id);
            if (!store) {
                return res.status(404).json({ message: 'Tienda no encontrada' });
            }
            res.json(store);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtener todas las tiendas del sistema
     * 
     * @endpoint GET /api/v1/stores
     * @access Privado (rol ADMIN)
     * 
     * @returns {200} Store[] - Array de todas las tiendas con owner populado
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Solo accesible para administradores.
     * Usado en AdminDashboardPage para mostrar y aprobar tiendas.
     * Incluye tiendas en todos los estados (PENDING, APPROVED, REJECTED).
     */
    async getAllStores(req, res) {
        try {
            const stores = await storeService.getAllStores();
            res.json(stores);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Aprobar una tienda pendiente
     * 
     * @endpoint PUT /api/v1/stores/:id/approve
     * @access Privado (rol ADMIN)
     * 
     * @param {string} req.params.id - ID de la tienda a aprobar
     * @returns {200} Store - Tienda con status actualizado a APPROVED
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Cambia el status de la tienda de PENDING a APPROVED.
     * Una vez aprobada, el dueño puede empezar a crear productos.
     * Solo un administrador puede aprobar tiendas.
     * 
     * @example
     * PUT /api/v1/stores/store_id_123/approve
     * Headers: { Authorization: "Bearer <admin_token>" }
     */
    async approveStore(req, res) {
        try {
            const store = await storeService.approveStore(req.params.id);
            res.json(store);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Actualizar información de mi tienda
     * 
     * @endpoint PUT /api/v1/stores
     * @access Privado (rol STORE, solo su tienda)
     * 
     * @param {string} req.user.id - ID del usuario autenticado
     * @param {Object} req.body - Campos a actualizar
     * @param {string} req.body.name - Nuevo nombre (opcional)
     * @param {string} req.body.description - Nueva descripción (opcional)
     * 
     * @returns {200} Store - Tienda actualizada
     * @returns {400} { message: string } - Error de validación o permisos
     * 
     * @description
     * Permite al dueño actualizar nombre y descripción de su tienda.
     * No se puede cambiar el status ni el owner.
     * 
     * @example
     * PUT /api/v1/stores
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "description": "Nueva descripción actualizada"
     * }
     */
    async updateStore(req, res) {
        try {
            const store = await storeService.updateStore(req.user.id, req.body);
            res.json(store);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new StoreController();
