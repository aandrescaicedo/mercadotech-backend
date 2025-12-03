/**
 * server.js - Punto de entrada del servidor backend
 * 
 * Propósito: Iniciar el servidor Express y conectar a MongoDB
 * 
 * Responsabilidades:
 * - Cargar variables de entorno desde .env
 * - Establecer conexión con MongoDB
 * - Iniciar servidor HTTP en el puerto configurado
 * - Manejo de errores de conexión
 * 
 * Variables de entorno requeridas:
 * - MONGO_URI: String de conexión a MongoDB
 * - PORT: Puerto del servidor (default: 5000)
 * - JWT_SECRET: Secreto para firmar JWTs (en .env)
 * 
 * Orden de ejecución:
 * 1. Cargar .env
 * 2. Conectar a MongoDB
 * 3. Si conexión exitosa → Iniciar servidor
 * 4. Si conexión falla → Log error y salir
 * 
 * Comandos para ejecutar:
 * - Desarrollo: npm run dev (con nodemon)
 * - Producción: npm start (node directo)
 */

// Cargar variables de entorno desde archivo .env
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app'); // Importar app configurada

/**
 * Configuración de puerto
 * Prioridad:
 * 1. Variable de entorno PORT (ej: en Heroku, Railway)
 * 2. Default a 5000 si no está definida
 */
const PORT = process.env.PORT || 5000;

/**
 * URI de conexión a MongoDB
 * 
 * Ejemplos de valores:
 * - Desarrollo local: 'mongodb://localhost:27017/mercadotech'
 * - MongoDB Atlas: 'mongodb+srv://user:pass@cluster.mongodb.net/mercadotech'
 * 
 * IMPORTANTE: El .env debe tener MONGO_URI configurado
 */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mercadotech';

/**
 * Conexión a MongoDB y arranque del servidor
 * 
 * Flujo:
 * 1. mongoose.connect() intenta conectar a MongoDB
 * 2. Promise se resuelve → Conexión exitosa
 * 3. app.listen() inicia el servidor HTTP
 * 4. Si falla la conexión → catch() maneja el error
 * 
 * Opciones de mongoose.connect implícitas (Mongoose 6+):
 * - useNewUrlParser: true (por defecto)
 * - useUnifiedTopology: true (por defecto)
 * 
 * @returns {Promise<void>}
 */
mongoose.connect(MONGO_URI)
    .then(() => {
        // Conexión exitosa a MongoDB
        console.log('Connected to MongoDB');

        /**
         * Iniciar servidor Express
         * 
         * @param {number} PORT - Puerto en el que escuchar
         * @param {Function} callback - Se ejecuta cuando el servidor está listo
         * 
         * El servidor ahora está escuchando en http://localhost:PORT
         * Listo para recibir peticiones HTTP
         */
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        /**
         * Error de conexión a MongoDB
         * 
         * Causas comunes:
         * - MONGO_URI incorrecto
         * - MongoDB no está corriendo (si es local)
         * - Problemas de red (si es Atlas)
         * - Credenciales inválidas
         * - IP no autorizada en MongoDB Atlas
         * 
         * El servidor NO se inicia si MongoDB falla
         */
        console.error('MongoDB connection error:', err);

        // No continuar si no hay BD
        // En producción, podrías querer reintentar o notificar
    });

/**
 * Notas de producción:
 * 
 * 1. Usar process manager como PM2:
 *    pm2 start server.js --name mercadotech-api
 * 
 * 2. Manejar señales de terminación graceful:
 *    process.on('SIGTERM', async () => {
 *      await mongoose.connection.close();
 *      process.exit(0);
 *    });
 * 
 * 3. Logging más robusto (Winston, Pino)
 * 
 * 4. Health check endpoint para monitoreo
 * 
 * 5. Configurar timeouts y limits apropiados
 */
