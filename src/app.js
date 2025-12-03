/**
 * app.js - Configuración principal de Express
 * 
 * Propósito: Configurar la aplicación Express con middleware y rutas
 * 
 * Responsabilidades:
 * - Configurar middleware global (CORS, parser JSON)
 * - Registrar todas las rutas de la API
 * - Definir endpoint raíz de bienvenida
 * - Exportar app para uso en server.js
 * 
 * Arquitectura:
 * - NO inicia el servidor (eso lo hace server.js)
 * - Solo configura y exporta la app
 * - Permite testing más fácil al separar configuración de ejecución
 * 
 * Módulos requeridos:
 * - express: Framework web
 * - cors: Middleware para CORS
 * - routes/*: Definiciones de rutas
 */

const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Crear instancia de Express
const app = express();

/**
 * Middleware Global
 * Se aplica a todas las peticiones
 */

/**
 * CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend (localhost:3000) haga peticiones al backend (localhost:5000)
 * 
 * Por defecto permite:
 * - Cualquier origen
 * - Métodos: GET, POST, PUT, DELETE, etc.
 * - Headers estándar + Authorization
 * 
 * En producción, configuraría origins específicos:
 * app.use(cors({ origin: 'https://mercadotech.com' }))
 */
app.use(cors());

/**
 * Body Parser para JSON
 * Parsea automáticamente req.body cuando Content-Type es application/json
 * Convierte el JSON string en objeto JavaScript accesible en controladores
 * 
 * Sin esto, req.body sería undefined
 */
app.use(express.json());

/**
 * Registro de Rutas
 * Cada ruta está montada en un prefijo específico
 * 
 * Base URL de la API: /api/v1
 * El /v1 permite versionado de la API (futuro: /api/v2)
 */

/**
 * Rutas de Autenticación
 * Base: /api/v1/auth
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/google-login
 */
app.use('/api/v1/auth', authRoutes);

/**
 * Rutas de Tiendas
 * Base: /api/v1/stores
 * - POST /api/v1/stores
 * - GET /api/v1/stores/my-store
 * - GET /api/v1/stores (admin)
 * - PUT /api/v1/stores/:id/approve (admin)
 * - PUT /api/v1/stores
 */
app.use('/api/v1/stores', storeRoutes);

/**
 * Rutas de Productos
 * Base: /api/v1/products
 * - GET /api/v1/products (con filtros)
 * - GET /api/v1/products/:id
 * - POST /api/v1/products
 * - PUT /api/v1/products/:id
 * - DELETE /api/v1/products/:id
 */
app.use('/api/v1/products', productRoutes);

/**
 * Rutas de Pedidos
 * Base: /api/v1/orders
 * - POST /api/v1/orders
 * - GET /api/v1/orders/:id
 * - GET /api/v1/orders/store-orders
 * - PUT /api/v1/orders/:id/status
 */
app.use('/api/v1/orders', orderRoutes);

/**
 * Rutas de Categorías
 * Base: /api/v1/categories
 * - GET /api/v1/categories
 * - GET /api/v1/categories/:id
 * - POST /api/v1/categories (admin)
 * - PUT /api/v1/categories/:id (admin)
 * - DELETE /api/v1/categories/:id (admin)
 */
app.use('/api/v1/categories', categoryRoutes);

/**
 * Rutas de Carrito
 * Base: /api/v1/cart
 * - GET /api/v1/cart
 * - PUT /api/v1/cart
 * - POST /api/v1/cart/sync
 * 
 * Nota: Se importa inline en lugar de variable separada
 */
app.use('/api/v1/cart', require('./routes/cartRoutes'));

/**
 * Ruta raíz - Endpoint de bienvenida
 * 
 * @endpoint GET /
 * @access Público
 * @returns {Object} { message: "Welcome to MercadoTech API" }
 * 
 * @description
 * Endpoint simple para verificar que el servidor está corriendo.
 * Útil para health checks y debugging.
 * 
 * @example
 * GET http://localhost:5000/
 * Response: { "message": "Welcome to MercadoTech API" }
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MercadoTech API' });
});

/**
 * Exportar app
 * 
 * Se exporta para que server.js pueda:
 * 1. Conectar a MongoDB
 * 2. Iniciar el servidor en un puerto
 * 
 * También permite testing:
 * - Importar app en tests sin iniciar servidor
 * - Usar supertest para peticiones HTTP de prueba
 */
module.exports = app;
