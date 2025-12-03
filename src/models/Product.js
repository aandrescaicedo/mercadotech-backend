/**
 * Product.js - Modelo de Producto
 * 
 * Propósito: Define la estructura de datos para los productos del marketplace
 * 
 * Responsabilidades:
 * - Almacenar información del producto (nombre, precio, stock, etc.)
 * - Vincular el producto con su tienda y categoría
 * - Almacenar URLs de imágenes del producto
 * 
 * Relaciones:
 * - Un Product pertenece a una Store (many-to-one)
 * - Un Product pertenece a una Category (many-to-one, opcional)
 * - Un Product puede estar en múltiples OrderItems
 * - Un Product puede estar en múltiples CartItems
 * 
 * Endpoints relacionados:
 * - GET /api/v1/products - Listar todos los productos (con filtros)
 * - GET /api/v1/products/:id - Obtener un producto específico
 * - POST /api/v1/products - Crear nuevo producto (requiere rol STORE)
 * - PUT /api/v1/products/:id - Actualizar producto (requiere ser dueño)
 * - DELETE /api/v1/products/:id - Eliminar producto (requiere ser dueño)
 */

const mongoose = require('mongoose');

/**
 * Schema de Producto
 * Define la estructura de los documentos de producto en MongoDB
 */
const productSchema = new mongoose.Schema({
    /**
     * Nombre del producto
     * - Descriptivo y sin espacios en blanco al inicio/final
     * - Visible en el catálogo y en las tarjetas de producto
     */
    name: {
        type: String,
        required: true,
        trim: true,
    },

    /**
     * Descripción detallada del producto
     * - Texto libre que explica características y beneficios
     * - Mostrada en la vista de detalles del producto
     */
    description: {
        type: String,
        required: true,
    },

    /**
     * Precio del producto
     * - En la moneda del sistema (generalmente pesos colombianos)
     * - Debe ser mayor o igual a 0
     * - Se formatea con separadores de miles en el frontend
     */
    price: {
        type: Number,
        required: true,
        min: 0,
    },

    /**
     * Cantidad disponible en inventario
     * - Debe ser mayor o igual a 0
     * - Se reduce al confirmar un pedido (no implementado en el MVP)
     * - Los productos con stock 0 aún se muestran pero podrían marcarse como "agotado"
     */
    stock: {
        type: Number,
        required: true,
        min: 0,
    },

    /**
     * Referencia a la tienda que vende el producto
     * - ObjectId que apunta a un documento Store
     * - Se usa populate() para obtener datos de la tienda (nombre, etc.)
     * - Permite filtrar productos por tienda
     */
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },

    /**
     * Array de URLs de imágenes del producto
     * - Cada string es una URL completa (ej: https://ejemplo.com/imagen.jpg)
     * - La primera imagen se usa como imagen principal en las tarjetas
     * - Opcional: un producto puede no tener imágenes
     */
    images: [{
        type: String, // URLs
    }],

    /**
     * Referencia a la categoría del producto
     * - ObjectId que apunta a un documento Category
     * - Se usa populate() para obtener el nombre de la categoría
     * - Permite filtrar productos por categoría en el catálogo
     * - Opcional para compatibilidad con productos creados antes de las categorías
     */
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false, // Optional for backward compatibility
    },

    /**
     * Fecha de creación del producto
     * - Se establece automáticamente al crear el documento
     */
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
