/**
 * User.js - Modelo de Usuario
 * 
 * Propósito: Define la estructura de datos para los usuarios del sistema
 * 
 * Responsabilidades:
 * - Almacenar información de autenticación (email, password, googleId)
 * - Gestionar roles de usuario (CLIENT, STORE, ADMIN)
 * - Encriptar contraseñas automáticamente antes de guardar
 * - Validar credenciales de inicio de sesión
 * 
 * Relaciones:
 * - Un User puede ser dueño de una Store (one-to-one)
 * - Un User puede crear múltiples Orders (one-to-many)
 * - Un User puede tener un Cart (one-to-one)
 * 
 * Endpoints relacionados:
 * - POST /api/v1/auth/register - Crear nuevo usuario
 * - POST /api/v1/auth/login - Iniciar sesión
 * - POST /api/v1/auth/google-login - Iniciar sesión con Google
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema de Usuario
 * Define la estructura de los documentos de usuario en MongoDB
 */
const userSchema = new mongoose.Schema({
    /**
     * Email del usuario
     * - Único en el sistema
     * - Convertido automáticamente a minúsculas
     * - Sin espacios en blanco
     */
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    /**
     * Contraseña encriptada
     * - Requerida solo si no hay googleId (permite login social sin password)
     * - Se encripta automáticamente antes de guardar (ver hook pre-save)
     */
    password: {
        type: String,
        required: function () { return !this.googleId; },
    },

    /**
     * ID de Google para autenticación social
     * - Único y opcional
     * - Permite login sin contraseña
     * - Sparse index: permite múltiples documentos con null
     */
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },

    /**
     * Rol del usuario en el sistema
     * - CLIENT: Puede comprar productos, gestionar carrito, realizar pedidos
     * - STORE: Puede crear y gestionar una tienda y sus productos
     * - ADMIN: Puede aprobar tiendas, gestionar categorías
     */
    role: {
        type: String,
        enum: ['CLIENT', 'STORE', 'ADMIN'],
        default: 'CLIENT',
    },

    /**
     * Fecha de creación del usuario
     * - Se establece automáticamente al crear el documento
     */
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Hook pre-save: Encripta la contraseña antes de guardar
 * 
 * Se ejecuta automáticamente antes de guardar un documento User
 * Solo encripta si la contraseña ha sido modificada o es nueva
 * 
 * @param {Function} next - Callback para continuar con el guardado
 */
userSchema.pre('save', async function (next) {
    // Si la contraseña no ha sido modificada, continuar sin encriptar
    if (!this.isModified('password')) return next();

    try {
        // Generar salt (valor aleatorio) para bcrypt
        const salt = await bcrypt.genSalt(10);
        // Encriptar la contraseña con el salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Método de instancia: Comparar contraseña ingresada con la encriptada
 * 
 * Usado en el proceso de login para validar credenciales
 * 
 * @param {string} candidatePassword - Contraseña en texto plano ingresada por el usuario
 * @returns {Promise<boolean>} - true si las contraseñas coinciden, false si no
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' });
 * const isMatch = await user.comparePassword('password123');
 * if (isMatch) {
 *   // Credenciales válidas
 * }
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
