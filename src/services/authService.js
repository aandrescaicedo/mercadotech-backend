/**
 * authService.js - Servicio de Autenticación
 * 
 * Propósito: Lógica de negocio para autenticación y gestión de usuarios
 * 
 * Responsabilidades:
 * - Validar que los emails no estén duplicados
 * - Crear nuevos usuarios con contraseñas encriptadas
 * - Validar credenciales de login
 * - Implementar login social (Google)
 * - Generar tokens JWT
 * 
 * Usado por: authController
 * Usa: userRepository, jwt
 */

const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');

class AuthService {
    /**
     * Registrar nuevo usuario
     * 
     * @param {Object} data - Datos del usuario
     * @param {string} data.email - Email único
     * @param {string} data.password - Contraseña en texto plano
     * @param {string} data.role - Rol del usuario (CLIENT, STORE, ADMIN)
     * 
     * @returns {Promise<Object>} { user: {...}, token: string }
     * @throws {Error} "El usuario ya existe"
     * 
     * @description
     * Flujo:
     * 1. Verifica que el email no exista
     * 2. Crea el usuario (password se encripta automáticamente en el modelo)
     * 3. Genera JWT
     * 4. Retorna usuario (sin password) y token
     */
    async register(data) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }

        const user = await userRepository.create(data);
        const token = this.generateToken(user._id, user.role);

        return { user: { id: user._id, email: user.email, role: user.role }, token };
    }

    /**
     * Iniciar sesión con email y contraseña
     * 
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña en texto plano
     * 
     * @returns {Promise<Object>} { user: {...}, token: string }
     * @throws {Error} "Credenciales inválidas"
     * 
     * @description
     * Flujo:
     * 1. Busca usuario por email
     * 2. Compara password con user.comparePassword()
     * 3. Si coincide, genera JWT
     * 4. Retorna usuario y token
     */
    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Credenciales inválidas');
        }

        const token = this.generateToken(user._id, user.role);

        return { user: { id: user._id, email: user.email, role: user.role }, token };
    }

    /**
     * Login social con Google (simulado en MVP)
     * 
     * @param {string} email - Email de la cuenta de Google
     * @param {string} googleId - ID único de Google
     * 
     * @returns {Promise<Object>} { user: {...}, token: string }
     * 
     * @description
     * Flujo:
     * 1. Busca usuario por email
     * 2. Si no existe → Crea nuevo usuario con googleId (sin password)
     * 3. Si existe sin googleId → Vincula googleId a cuenta existente
     * 4. Si existe con googleId → Login normal
     * 5. Genera JWT y retorna
     * 
     * Permite unificar cuentas: usuario registrado tradicionalmente
     * puede luego usar Google Login y viceversa.
     */
    async googleLogin(email, googleId) {
        let user = await userRepository.findByEmail(email);
        if (!user) {
            // Crear nuevo usuario con Google
            user = await userRepository.create({ email, googleId, role: 'CLIENT' });
        } else if (!user.googleId) {
            // Vincular Google a cuenta existente
            user.googleId = googleId;
            await user.save();
        }
        const token = this.generateToken(user._id, user.role);
        return { user: { id: user._id, email: user.email, role: user.role }, token };
    }

    /**
     * Generar token JWT
     * 
     * @param {string} userId - ObjectId del usuario
     * @param {string} role - Rol del usuario
     * 
     * @returns {string} Token JWT firmado
     * 
     * @description
     * Payload del token:
     * - id: ID del usuario
     * - role: Rol del usuario
     * - iat: Timestamp de creación
     * - exp: Timestamp de expiración (1 día después)
     * 
     * El token se usa en el header Authorization de peticiones protegidas.
     */
    generateToken(userId, role) {
        return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret_key_dev', {
            expiresIn: '1d',
        });
    }
}

module.exports = new AuthService();
