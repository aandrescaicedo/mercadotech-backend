/**
 * authMiddleware.js - Middleware de Autenticación y Autorización
 * 
 * Propósito: Proteger rutas que requieren autenticación y/o roles específicos
 * 
 * Responsabilidades:
 * - Verificar tokens JWT en headers de peticiones
 * - Validar autenticidad y expiración del token
 * - Adjuntar información del usuario a req.user
 * - Verificar roles específicos cuando se requiera
 * 
 * Exports:
 * - protect: Middleware de autenticación (requiere token válido)
 * - authorize: Middleware de autorización (requiere rol específico)
 * 
 * Uso típico:
 * router.post('/products', protect, productController.create);
 * router.get('/admin', protect, authorize('ADMIN'), adminController.dashboard);
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware de protección de rutas (Autenticación)
 * 
 * @middleware protect
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * 
 * @returns {401} { message: "Not authorized, no token" } - Si no hay token
 * @returns {401} { message: "Not authorized, token failed" } - Si el token es inválido
 * 
 * @description
 * Flujo de ejecución:
 * 1. Lee el header Authorization
 * 2. Extrae el token (formato: "Bearer <token>")
 * 3. Verifica el token con JWT_SECRET
 * 4. Decodifica el payload (contiene: id, role, iat, exp)
 * 5. Adjunta el payload a req.user
 * 6. Llama a next() para continuar
 * 
 * Si falla en cualquier paso, retorna 401 y no continúa.
 * 
 * req.user después de este middleware:
 * {
 *   id: "user_id_here",
 *   role: "CLIENT|STORE|ADMIN",
 *   iat: 1234567890,  // issued at
 *   exp: 1234654290   // expiration
 * }
 * 
 * @example
 * // En una ruta protegida:
 * router.post('/products', protect, (req, res) => {
 *   const userId = req.user.id;     // Disponible gracias a protect
 *   const userRole = req.user.role; // Disponible gracias a protect
 * });
 */
const protect = (req, res, next) => {
    let token;

    // Verificar que exista el header Authorization y que comience con "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraer el token (quitar "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_dev');

            // Adjuntar usuario al request para uso en controladores
            req.user = decoded;

            // Continuar al siguiente middleware/controlador
            next();
        } catch (error) {
            // Token inválido, expirado o corrupto
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Si no hay token en el header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Middleware de autorización por roles
 * 
 * @middleware authorize
 * @param {...string} roles - Roles permitidos (ej: 'ADMIN', 'STORE')
 * @returns {Function} Middleware que verifica el rol
 * 
 * @returns {403} { message: "User role ... is not authorized..." } - Si el rol no coincide
 * 
 * @description
 * Este es un middleware de orden superior (retorna otro middleware).
 * Debe usarse DESPUÉS de protect, ya que requiere req.user.
 * 
 * Flujo:
 * 1. Verifica si req.user.role está en la lista de roles permitidos
 * 2. Si sí, llama a next()
 * 3. Si no, retorna 403 Forbidden
 * 
 * IMPORTANTE: Siempre usar después de protect
 * 
 * @example
 * // Solo admins pueden acceder:
 * router.get('/admin/users', protect, authorize('ADMIN'), controller.getUsers);
 * 
 * // Admins y dueños de tienda pueden acceder:
 * router.get('/dashboard', protect, authorize('ADMIN', 'STORE'), controller.dashboard);
 * 
 * @note
 * No se usa actualmente en las rutas del proyecto, pero está disponible.
 * Los permisos se validan principalmente en los servicios.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
