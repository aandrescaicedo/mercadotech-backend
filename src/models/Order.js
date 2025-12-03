/**
 * Order.js - Modelo de Pedido
 * 
 * Propósito: Define la estructura de datos para los pedidos realizados por los clientes
 * 
 * Responsabilidades:
 * - Almacenar información del pedido (items, total, dirección de envío)
 * - Gestionar el estado del pedido y su historial
 * - Vincular el pedido con el usuario que lo realizó
 * - Almacenar snapshots de productos al momento de la compra
 * 
 * Relaciones:
 * - Un Order pertenece a un User (many-to-one)
 * - Un Order contiene múltiples items (embedded documents)
 * - Cada item referencia un Product y una Store
 * 
 * Flujo de estados:
 * PENDING -> PAID -> SHIPPED -> DELIVERED
 *         -> CANCELLED (en cualquier momento)
 * 
 * Endpoints relacionados:
 * - POST /api/v1/orders - Crear nuevo pedido
 * - GET /api/v1/orders/:id - Obtener detalles de un pedido
 * - GET /api/v1/orders/store-orders - Obtener pedidos de la tienda del usuario
 * - PUT /api/v1/orders/:id/status - Actualizar estado del pedido
 */

const mongoose = require('mongoose');

/**
 * Schema de Pedido
 * Define la estructura de los documentos de pedido en MongoDB
 */
const orderSchema = new mongoose.Schema({
    /**
     * Referencia al usuario que realizó el pedido
     * - ObjectId que apunta a un documento User
     * - Se usa populate() para obtener datos del cliente
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    /**
     * Items del pedido (subdocumentos embebidos)
     * Cada item representa un producto comprado con su cantidad
     * 
     * Nota importante: Se almacena una copia del nombre y precio del producto
     * al momento de la compra para mantener un registro histórico, incluso si
     * el producto se modifica o elimina posteriormente
     */
    items: [
        {
            /**
             * Referencia al producto
             * - Se usa para obtener información actualizada (ej: imagen)
             * - Puede ser null si el producto fue eliminado
             */
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },

            /**
             * Snapshot del nombre del producto al momento de la compra
             * - Permite mostrar el pedido incluso si el producto cambia de nombre
             */
            name: String,

            /**
             * Cantidad comprada del producto
             * - Debe ser al menos 1
             */
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            /**
             * Snapshot del precio del producto al momento de la compra
             * - Permite calcular el total histórico correcto
             * - No afectado por cambios futuros en el precio
             */
            price: {
                type: Number,
                required: true,
            },

            /**
             * Referencia a la tienda del producto
             * - Permite filtrar pedidos por tienda
             * - Usado en el dashboard de la tienda para ver sus ventas
             */
            store: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Store',
                required: true,
            },
        },
    ],

    /**
     * Total del pedido
     * - Suma de (precio * cantidad) de todos los items
     * - Calculado en el backend al crear el pedido
     */
    total: {
        type: Number,
        required: true,
    },

    /**
     * Dirección de envío del pedido
     * - Ingresada por el cliente en el checkout
     * - Subdocumento embebido
     */
    shippingAddress: {
        address: String,       // Calle y número
        city: String,          // Ciudad
        postalCode: String,    // Código postal
        country: String,       // País
    },

    /**
     * Estado actual del pedido
     * - PENDING: Pedido creado, esperando pago
     * - PAID: Pago confirmado
     * - SHIPPED: Pedido enviado
     * - DELIVERED: Pedido entregado
     * - CANCELLED: Pedido cancelado
     */
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
    },

    /**
     * Historial de cambios de estado
     * - Array de subdocumentos que registra cada cambio de estado
     * - Permite rastrear quién y cuándo cambió el estado
     * - Se actualiza automáticamente en el servicio al cambiar el estado
     */
    statusHistory: [
        {
            /**
             * Estado registrado en este cambio
             */
            status: {
                type: String,
                enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                required: true,
            },

            /**
             * Fecha y hora del cambio de estado
             */
            timestamp: {
                type: Date,
                default: Date.now,
            },

            /**
             * Usuario que realizó el cambio (generalmente el dueño de la tienda)
             * - Opcional: el estado inicial PENDING no tiene updatedBy
             */
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
    ],

    /**
     * Resultado del pago
     * - Información del procesador de pagos (PayPal, Stripe, etc.)
     * - En el MVP actual, este campo no se usa (pago simulado)
     * - Preparado para integración futura de pasarela de pagos
     */
    paymentResult: {
        id: String,              // ID de transacción del procesador
        status: String,          // Estado del pago
        update_time: String,     // Última actualización
        email_address: String,   // Email asociado al pago
    },

    /**
     * Fecha de creación del pedido
     * - Se establece automáticamente al crear el documento
     */
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
