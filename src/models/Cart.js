/**
 * Cart.js - Modelo de Carrito
 * 
 * Propósito: Define la estructura de datos para el carrito de compras persistente
 * 
 * Responsabilidades:
 * - Almacenar items del carrito de usuarios autenticados en la base de datos
 * - Permitir sincronización del carrito entre dispositivos
 * - Mantener el carrito del usuario entre sesiones
 * 
 * Relaciones:
 * - Un Cart pertenece a un User (one-to-one)
 * - Un Cart contiene múltiples items (embedded documents)
 * - Cada item referencia un Product y una Store
 * 
 * Flujo de datos:
 * 1. Usuario agrega producto al carrito (localStorage + API si está autenticado)
 * 2. Al iniciar sesión, se sincroniza el carrito local con el de la BD
 * 3. Los cambios se guardan en tiempo real en BD y localStorage
 * 
 * Endpoints relacionados:
 * - GET /api/v1/cart - Obtener carrito del usuario autenticado
 * - PUT /api/v1/cart - Actualizar carrito completo
 * - POST /api/v1/cart/sync - Sincronizar carrito local con BD
 */

const mongoose = require('mongoose');

/**
 * Schema de Carrito
 * Define la estructura de los documentos de carrito en MongoDB
 */
const cartSchema = new mongoose.Schema({
    /**
     * Referencia al usuario dueño del carrito
     * - ObjectId que apunta a un documento User
     * - Único: cada usuario solo puede tener un carrito
     * - Los usuarios no autenticados usan solo localStorage
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    /**
     * Items del carrito (subdocumentos embebidos)
     * Cada item representa un producto agregado con su cantidad
     * 
     * Nota: A diferencia de Order, aquí NO se almacenan snapshots
     * El carrito siempre muestra información actualizada del producto
     */
    items: [
        {
            /**
             * Referencia al producto
             * - Se usa populate() para obtener datos actualizados (nombre, precio, imagen)
             * - Si el producto se elimina, el item se puede limpiar del carrito
             */
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },

            /**
             * Cantidad del producto en el carrito
             * - Debe ser al menos 1
             * - El usuario puede incrementar/decrementar desde la UI
             */
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            /**
             * Referencia a la tienda del producto
             * - Usado para agrupar items por tienda en el checkout
             * - Permite crear múltiples pedidos (uno por tienda)
             */
            store: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Store',
                required: true,
            },
        },
    ],

    /**
     * Fecha de última actualización del carrito
     * - Se actualiza cada vez que se modifica el carrito
     * - Usado para sincronización de datos
     */
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Cart', cartSchema);
