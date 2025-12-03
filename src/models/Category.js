/**
 * Category.js - Modelo de Categoría
 * 
 * Propósito: Define la estructura de datos para las categorías de productos
 * 
 * Responsabilidades:
 * - Almacenar información de la categoría (nombre, descripción)
 * - Permitir la clasificación de productos
 * - Facilitar el filtrado en el catálogo
 * 
 * Relaciones:
 * - Una Category puede tener múltiples Products (one-to-many)
 * 
 * Endpoints relacionados:
 * - GET /api/v1/categories - Listar todas las categorías
 * - POST /api/v1/categories - Crear nueva categoría (solo ADMIN)
 * - PUT /api/v1/categories/:id - Actualizar categoría (solo ADMIN)
 * - DELETE /api/v1/categories/:id - Eliminar categoría (solo ADMIN)
 */

const mongoose = require('mongoose');

/**
 * Schema de Categoría
 * Define la estructura de los documentos de categoría en MongoDB
 */
const categorySchema = new mongoose.Schema({
    /**
     * Nombre de la categoría
     * - Único en el sistema (ej: "Electrónica", "Ropa", "Alimentos")
     * - Sin espacios en blanco al inicio/final
     * - Usado en el dropdown de filtros del catálogo
     */
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    /**
     * Descripción de la categoría
     * - Texto libre que explica qué tipo de productos incluye
     * - Usado en la interfaz de administración
     */
    description: {
        type: String,
        required: true,
    },

    /**
     * Fecha de creación de la categoría
     * - Se establece automáticamente al crear el documento
     */
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Category', categorySchema);
