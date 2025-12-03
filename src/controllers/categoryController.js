/**
 * categoryController.js - Controlador de Categorías
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con categorías de productos
 * 
 * Responsabilidades:
 * - Gestionar CRUD completo de categorías
 * - Validar que no existan categorías duplicadas
 * - Solo administradores pueden crear/editar/eliminar
 * - Listar categorías está disponible para todos
 * 
 * Endpoints expuestos:
 * - GET /api/v1/categories - Listar todas las categorías
 * - GET /api/v1/categories/:id - Obtener una categoría
 * - POST /api/v1/categories - Crear categoría (admin)
 * - PUT /api/v1/categories/:id - Actualizar categoría (admin)
 * - DELETE /api/v1/categories/:id - Eliminar categoría (admin)
 */

const categoryService = require('../services/categoryService');

class CategoryController {
    /**
     * Crear nueva categoría
     * 
     * @endpoint POST /api/v1/categories
     * @access Privado (rol ADMIN)
     * 
     * @param {Object} req.body - Datos de la categoría
     * @param {string} req.body.name - Nombre de la categoría (único)
     * @param {string} req.body.description - Descripción de la categoría
     * 
     * @returns {201} Category - Categoría creada
     * @returns {400} { message: string } - Error de validación (ej: nombre duplicado)
     * 
     * @description
     * Solo administradores pueden crear categorías.
     * El nombre debe ser único en el sistema.
     * Usado en CategoryManagementPage.
     * 
     * @example
     * POST /api/v1/categories
     * Headers: { Authorization: "Bearer <admin_token>" }
     * Body: {
     *   "name": "Electrónica",
     *   "description": "Productos electrónicos y tecnología"
     * }
     */
    async createCategory(req, res) {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Obtener todas las categorías
     * 
     * @endpoint GET /api/v1/categories
     * @access Público
     * 
     * @returns {200} Category[] - Array de todas las categorías
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Endpoint público, no requiere autenticación.
     * Usado en:
     * - CatalogPage (dropdown de filtro)
     * - ProductForm (seleccionar categoría al crear/editar producto)
     * - CategoryManagementPage (listar para admin)
     */
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtener una categoría por ID
     * 
     * @endpoint GET /api/v1/categories/:id
     * @access Público
     * 
     * @param {string} req.params.id - ID de la categoría
     * @returns {200} Category - Categoría encontrada
     * @returns {404} { message: "Categoría no encontrada" }
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Obtiene detalles de una categoría específica.
     * Endpoint auxiliar, no usado activamente en el frontend actual.
     */
    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Actualizar una categoría existente
     * 
     * @endpoint PUT /api/v1/categories/:id
     * @access Privado (rol ADMIN)
     * 
     * @param {string} req.params.id - ID de la categoría
     * @param {Object} req.body - Campos a actualizar
     * @param {string} req.body.name - Nuevo nombre (opcional)
     * @param {string} req.body.description - Nueva descripción (opcional)
     * 
     * @returns {200} Category - Categoría actualizada
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Solo administradores pueden actualizar categorías.
     * Si se cambia el nombre, debe seguir siendo único.
     * Usado en CategoryManagementPage.
     * 
     * @example
     * PUT /api/v1/categories/category_id_123
     * Headers: { Authorization: "Bearer <admin_token>" }
     * Body: {
     *   "description": "Productos de tecnología y electrónica"
     * }
     */
    async updateCategory(req, res) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Eliminar una categoría
     * 
     * @endpoint DELETE /api/v1/categories/:id
     * @access Privado (rol ADMIN)
     * 
     * @param {string} req.params.id - ID de la categoría
     * @returns {200} { message: "Categoría eliminada exitosamente" }
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Solo administradores pueden eliminar categorías.
     * IMPORTANTE: No verifica si hay productos usando esta categoría.
     * Los productos quedarán con category=null si se elimina su categoría.
     * Usado en CategoryManagementPage.
     * 
     * @example
     * DELETE /api/v1/categories/category_id_123
     * Headers: { Authorization: "Bearer <admin_token>" }
     */
    async deleteCategory(req, res) {
        try {
            await categoryService.deleteCategory(req.params.id);
            res.json({ message: 'Categoría eliminada exitosamente' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();
