/**
 * Store.js - Modelo de Tienda
 * 
 * Propósito: Define la estructura de datos para las tiendas del marketplace
 * 
 * Responsabilidades:
 * - Almacenar información básica de la tienda (nombre, descripción)
 * - Vincular la tienda con su dueño (User)
 * - Gestionar el estado de aprobación de la tienda
 * 
 * Relaciones:
 * - Una Store pertenece a un User (many-to-one)
 * - Una Store puede tener múltiples Products (one-to-many)
 * - Una Store puede recibir múltiples Orders a través de sus productos
 * 
 * Flujo de estados:
 * PENDING -> APPROVED (por admin)
 * PENDING -> REJECTED (por admin)
 * 
 * Endpoints relacionados:
 * - POST /api/v1/stores - Crear nueva tienda (requiere rol STORE)
 * - GET /api/v1/stores - Obtener todas las tiendas (solo ADMIN)
 * - GET /api/v1/stores/my-store - Obtener tienda del usuario autenticado
 * - PUT /api/v1/stores/:id/approve - Aprobar tienda (solo ADMIN)
 */

const mongoose = require('mongoose');

/**
 * Schema de Tienda
 * Define la estructura de los documentos de tienda en MongoDB
 */
const storeSchema = new mongoose.Schema({
    /**
     * Nombre de la tienda
     * - Único en el sistema (no puede haber dos tiendas con el mismo nombre)
     * - Sin espacios en blanco al inicio/final
     */
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    /**
     * Descripción de la tienda
     * - Texto libre que describe los productos o servicios
     * - Visible para los clientes en el catálogo
     */
    description: {
        type: String,
        required: true,
    },

    /**
     * Referencia al dueño de la tienda
     * - ObjectId que apunta a un documento User
     * - El usuario debe tener rol STORE
     * - Se usa populate() para obtener datos completos del dueño
     */
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    /**
     * Estado de aprobación de la tienda
     * - PENDING: Recién creada, esperando aprobación del admin
     * - APPROVED: Aprobada por admin, puede vender productos
     * - REJECTED: Rechazada por admin (no implementado completamente)
     * 
     * Solo las tiendas APPROVED pueden mostrar sus productos en el catálogo
     */
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },

    /**
     * Fecha de creación de la tienda
     * - Se establece automáticamente al crear el documento
     */
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Store', storeSchema);
