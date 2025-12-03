/**
 * authController.js - Controlador de Autenticación
 * 
 * Propósito: Maneja las peticiones HTTP relacionadas con autenticación
 * 
 * Responsabilidades:
 * - Recibir y validar datos de entrada (req.body)
 * - Delegar lógica de negocio al authService
 * - Retornar respuestas HTTP apropiadas con códigos de estado
 * - Manejar errores y retornar mensajes al cliente
 * 
 * Endpoints expuestos:
 * - POST /api/v1/auth/register - Registro de usuarios
 * - POST /api/v1/auth/login - Inicio de sesión tradicional
 * - POST /api/v1/auth/google-login - Inicio de sesión con Google
 */

const authService = require('../services/authService');

class AuthController {
    /**
     * Registrar nuevo usuario
     * 
     * @endpoint POST /api/v1/auth/register
     * @access Público
     * 
     * @param {Object} req.body - { email: string, password: string, role: string }
     * @returns {201} { user: { id, email, role }, token: string }
     * @returns {400} { message: string } - Error de validación
     * 
     * @example
     * POST /api/v1/auth/register
     * Body: {
     *   "email": "user@example.com",
     *   "password": "password123",
     *   "role": "CLIENT"
     * }
     */
    async register(req, res) {
        try {
            const { email, password, role } = req.body;
            const result = await authService.register({ email, password, role });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Iniciar sesión con email y contraseña
     * 
     * @endpoint POST /api/v1/auth/login
     * @access Público
     * 
     * @param {Object} req.body - { email: string, password: string }
     * @returns {200} { user: { id, email, role }, token: string }
     * @returns {401} { message: string } - Credenciales inválidas
     * 
     * @example
     * POST /api/v1/auth/login
     * Body: {
     *   "email": "user@example.com",
     *   "password": "password123"
     * }
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    /**
     * Iniciar sesión con Google (simulado en MVP)
     * 
     * @endpoint POST /api/v1/auth/google-login
     * @access Público
     * 
     * @param {Object} req.body - { email: string, googleId: string }
     * @returns {200} { user: { id, email, role }, token: string }
     * @returns {400} { message: string } - Error en el proceso
     * 
     * @description
     * En el MVP, este endpoint simula el login social.
     * - Si el usuario existe, lo vincula con googleId
     * - Si no existe, crea uno nuevo con rol CLIENT
     * - Retorna JWT para autenticación
     * 
     * @example
     * POST /api/v1/auth/google-login
     * Body: {
     *   "email": "user@gmail.com",
     *   "googleId": "google_1234567890"
     * }
     */
    async googleLogin(req, res) {
        try {
            const { email, googleId } = req.body;
            const result = await authService.googleLogin(email, googleId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();
