/**
 * productController.js - Controlador de Productos
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con productos
 * 
 * Responsabilidades:
 * - Gestionar CRUD completo de productos
 * - Aplicar filtros de búsqueda y categoría
 * - Validar permisos (solo dueño puede editar/eliminar)
 * - Retornar respuestas HTTP apropiadas
 * 
 * Endpoints expuestos:
 * - GET /api/v1/products - Listar productos con filtros
 * - GET /api/v1/products/store/:storeId - Productos de una tienda
 * - POST /api/v1/products - Crear producto
 * - PUT /api/v1/products/:id - Actualizar producto
 * - DELETE /api/v1/products/:id - Eliminar producto
 */

const productService = require('../services/productService');

class ProductController {
    /**
     * Crear nuevo producto
     * 
     * @endpoint POST /api/v1/products
     * @access Privado (rol STORE con tienda aprobada)
     * 
     * @param {string} req.user.id - ID del dueño de la tienda
     * @param {Object} req.body - Datos del producto
     * @param {string} req.body.name - Nombre del producto
     * @param {string} req.body.description - Descripción
     * @param {number} req.body.price - Precio
     * @param {number} req.body.stock - Stock disponible
     * @param {string[]} req.body.images - URLs de imágenes
     * @param {string} req.body.category - ID de categoría (opcional)
     * 
     * @returns {201} Product - Producto creado
     * @returns {400} { message: string } - Error de validación
     * 
     * @description
     * Valida que el usuario tenga una tienda aprobada antes de crear el producto.
     * El storeId se obtiene automáticamente del usuario autenticado.
     * 
     * @example
     * POST /api/v1/products
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "name": "Laptop Dell",
     *   "description": "Laptop Dell Inspiron 15",
     *   "price": 2500000,
     *   "stock": 10,
     *   "images": ["https://example.com/laptop.jpg"],
     *   "category": "category_id_123"
     * }
     */
    async createProduct(req, res) {
        try {
            const product = await productService.createProduct(req.user.id, req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Obtener productos de una tienda específica
     * 
     * @endpoint GET /api/v1/products/store/:storeId
     * @access Público
     * 
     * @param {string} req.params.storeId - ID de la tienda
     * @returns {200} Product[] - Array de productos de la tienda
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Retorna todos los productos que pertenecen a una tienda específica.
     * No requiere autenticación.
     */
    async getProductsByStore(req, res) {
        try {
            const products = await productService.getProductsByStore(req.params.storeId);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtener todos los productos con filtros opcionales
     * 
     * @endpoint GET /api/v1/products
     * @access Público
     * 
     * @param {Object} req.query - Parámetros de filtrado
     * @param {string} req.query.search - Búsqueda en nombre y descripción
     * @param {string} req.query.category - ID de categoría
     * @param {number} req.query.minPrice - Precio mínimo
     * @param {number} req.query.maxPrice - Precio máximo
     * 
     * @returns {200} Product[] - Array de productos filtrados
     * @returns {500} { message: string } - Error del servidor
     * 
     * @description
     * Endpoint principal del catálogo. Soporta múltiples filtros simultáneos.
     * Los productos se populan con información de tienda y categoría.
     * 
     * @example
     * GET /api/v1/products?search=laptop&category=electronics&minPrice=1000000&maxPrice=5000000
     */
    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts(req.query);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Actualizar un producto existente
     * 
     * @endpoint PUT /api/v1/products/:id
     * @access Privado (solo dueño del producto)
     * 
     * @param {string} req.params.id - ID del producto
     * @param {string} req.user.id - ID del usuario autenticado
     * @param {Object} req.body - Campos a actualizar
     * 
     * @returns {200} Product - Producto actualizado
     * @returns {400} { message: string } - Error de validación o permisos
     * 
     * @description
     * Valida que el usuario sea el dueño de la tienda antes de permitir la actualización.
     * Permite actualizar cualquier campo del producto.
     * 
     * @example
     * PUT /api/v1/products/product_id_123
     * Headers: { Authorization: "Bearer <token>" }
     * Body: {
     *   "price": 2800000,
     *   "stock": 15
     * }
     */
    async updateProduct(req, res) {
        try {
            const product = await productService.updateProduct(req.user.id, req.params.id, req.body);
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Eliminar un producto
     * 
     * @endpoint DELETE /api/v1/products/:id
     * @access Privado (solo dueño del producto)
     * 
     * @param {string} req.params.id - ID del producto
     * @param {string} req.user.id - ID del usuario autenticado
     * 
     * @returns {200} { message: "Producto eliminado" }
     * @returns {400} { message: string } - Error de validación o permisos
     * 
     * @description
     * Valida que el usuario sea el dueño de la tienda antes de permitir la eliminación.
     * El producto se elimina permanentemente de la base de datos.
     * 
     * @example
     * DELETE /api/v1/products/product_id_123
     * Headers: { Authorization: "Bearer <token>" }
     */
    async deleteProduct(req, res) {
        try {
            await productService.deleteProduct(req.user.id, req.params.id);
            res.json({ message: 'Producto eliminado' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new ProductController();
