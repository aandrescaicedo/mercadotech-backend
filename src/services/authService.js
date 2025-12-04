/**
 * authService.js - Servicio de Autenticación
 * 
 * Propósito: Lógica de negocio para autenticación y gestión de usuarios
 * 
 * Responsabilidades:
 * - Validar que los emails no estén duplicados
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
 * Usa: userRepository, jwt, bcrypt
 */

const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    /**
     * Registrar nuevo usuario
     * @param {Object} data - Datos del usuario
     * @param {string} data.email - Email único
     * @param {string} data.password - Contraseña en texto plano
     * @param {string} data.role - Rol del usuario (CLIENT, STORE, ADMIN)
     * @returns {Promise<Object>} { user: {...}, token: string }
     * @throws {Error} "El usuario ya existe"
     */
    async register(email, password, role) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }
        // Password hashing is handled by the User model pre-save hook
        const user = await userRepository.create({ email, password, role });
        return user;
    }

    /**
     * Iniciar sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<Object>} { user: {...}, token: string }
     * @throws {Error} "Credenciales inválidas"
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
     * @param {string} email - Email de la cuenta de Google
     * @param {string} googleId - ID único de Google
     * @returns {Promise<Object>} { user: {...}, token: string }
     */
    async googleLogin(email, googleId) {
        let user = await userRepository.findByEmail(email);
        if (!user) {
            user = await userRepository.create({ email, googleId, role: 'CLIENT' });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        const token = this.generateToken(user._id, user.role);
        return { user: { id: user._id, email: user.email, role: user.role }, token };
    }

    /**
     * Generar token JWT
     * @param {string} userId - ObjectId del usuario
     * @param {string} role - Rol del usuario
     * @returns {string} Token JWT firmado
     */
    generateToken(userId, role) {
        return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret_key_dev', { expiresIn: '1d' });
    }
}

module.exports = new AuthService();
