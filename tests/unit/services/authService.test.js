/**
 * Tests Unitarios para authService
 * 
 * Propósito:
 * Verificar la lógica de autenticación (registro, login, validaciones)
 * sin depender de la base de datos real.
 * 
 * Dependencias:
 * - authService: Servicio de autenticación principal
 * - userRepository: Mock del repositorio de usuarios
 * - bcryptjs: Para verificar hash de contraseñas
 * - jsonwebtoken: Para verificar generación de tokens
 * 
 * Casos de Prueba:
 * 1. Registro exitoso con datos válidos
 * 2. Registro fallido con email duplicado
 * 3. Login exitoso con credenciales válidas
 * 4. Login fallido con credenciales inválidas
 * 5. Google Login simulado exitoso
 */

const authService = require('../../src/services/authService');
const userRepository = require('../../src/repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock del repositorio para no depender de MongoDB
jest.mock('../../src/repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService - Tests Unitarios', () => {
    // Limpiar mocks antes de cada test para evitar interferencias
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Registro Exitoso
     * 
     * Qué prueba:
     * - El servicio puede registrar un nuevo usuario correctamente
     * - La contraseña se hashea antes de guardarse
     * - Se retorna el usuario sin la contraseña
     * 
     * Dependencias mockeadas:
     * - userRepository.findByEmail: Retorna null (no existe usuario)
     * - bcrypt.hash: Simula el hash de contraseña
     * - userRepository.create: Simula creación en DB
     */
    test('debe registrar un nuevo usuario exitosamente', async () => {
        // Arrange - Preparar datos de prueba
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            role: 'CLIENT'
        };

        const hashedPassword = 'hashed_password_123';
        const createdUser = {
            _id: 'user123',
            email: userData.email,
            role: userData.role,
            password: hashedPassword
        };

        // Configurar mocks
        userRepository.findByEmail.mockResolvedValue(null); // Usuario no existe
        bcrypt.hash.mockResolvedValue(hashedPassword);
        userRepository.create.mockResolvedValue(createdUser);

        // Act - Ejecutar la función a probar
        const result = await authService.register(
            userData.email,
            userData.password,
            userData.role
        );

        // Assert - Verificar resultados
        expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
        expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
        expect(userRepository.create).toHaveBeenCalledWith({
            email: userData.email,
            password: hashedPassword,
            role: userData.role
        });
        expect(result).toEqual(createdUser);
    });

    /**
     * Test 2: Registro Fallido - Email Duplicado
     * 
     * Qué prueba:
     * - El servicio rechaza registro si el email ya existe
     * - Se lanza un error apropiado
     * 
     * Dependencias mockeadas:
     * - userRepository.findByEmail: Retorna usuario existente
     */
    test('debe rechazar registro con email duplicado', async () => {
        // Arrange
        const existingUser = {
            _id: 'existing123',
            email: 'existing@example.com',
            role: 'CLIENT'
        };

        userRepository.findByEmail.mockResolvedValue(existingUser);

        // Act & Assert - Verificar que se lanza error
        await expect(
            authService.register('existing@example.com', 'password123', 'CLIENT')
        ).rejects.toThrow('El correo ya está registrado');

        // Verificar que no se intentó crear usuario
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Test 3: Login Exitoso
     * 
     * Qué prueba:
     * - El servicio puede autenticar con credenciales válidas
     * - Se genera un token JWT
     * - Se retorna usuario y token
     * 
     * Dependencias mockeadas:
     * - userRepository.findByEmail: Retorna usuario válido
     * - bcrypt.compare: Retorna true (contraseña coincide)
     * - jwt.sign: Retorna token simulado
     */
    test('debe autenticar usuario con credenciales válidas', async () => {
        // Arrange
        const credentials = {
            email: 'user@example.com',
            password: 'correctPassword'
        };

        const storedUser = {
            _id: 'user123',
            email: credentials.email,
            password: 'hashed_password',
            role: 'CLIENT'
        };

        const mockToken = 'jwt_token_123';

        userRepository.findByEmail.mockResolvedValue(storedUser);
        bcrypt.compare.mockResolvedValue(true); // Contraseña correcta
        jwt.sign.mockReturnValue(mockToken);

        // Act
        const result = await authService.login(
            credentials.email,
            credentials.password
        );

        // Assert
        expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
        expect(bcrypt.compare).toHaveBeenCalledWith(
            credentials.password,
            storedUser.password
        );
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: storedUser._id, role: storedUser.role },
            expect.any(String), // JWT_SECRET
            expect.any(Object) // Opciones
        );
        expect(result).toEqual({
            user: expect.objectContaining({
                id: storedUser._id,
                email: storedUser.email,
                role: storedUser.role
            }),
            token: mockToken
        });
    });

    /**
     * Test 4: Login Fallido - Credenciales Inválidas
     * 
     * Qué prueba:
     * - El servicio rechaza login con contraseña incorrecta
     * - Se lanza error apropiado
     * 
     * Dependencias mockeadas:
     * - userRepository.findByEmail: Retorna usuario
     * - bcrypt.compare: Retorna false (contraseña no coincide)
     */
    test('debe rechazar login con contraseña incorrecta', async () => {
        // Arrange
        const storedUser = {
            _id: 'user123',
            email: 'user@example.com',
            password: 'hashed_correct_password',
            role: 'CLIENT'
        };

        userRepository.findByEmail.mockResolvedValue(storedUser);
        bcrypt.compare.mockResolvedValue(false); // Contraseña incorrecta

        // Act & Assert
        await expect(
            authService.login('user@example.com', 'wrongPassword')
        ).rejects.toThrow('Credenciales inválidas');

        expect(jwt.sign).not.toHaveBeenCalled();
    });

    /**
     * Test 5: Google Login Simulado
     * 
     * Qué prueba:
     * - El servicio puede autenticar con Google (simulado)
     * - Se crea usuario si no existe
     * - Se retorna token
     * 
     * Dependencias mockeadas:
     * - userRepository.findByEmail: Retorna null (usuario nuevo)
     * - userRepository.create: Crea usuario de Google
     * - jwt.sign: Genera token
     */
    test('debe crear usuario con Google Login si no existe', async () => {
        // Arrange
        const googleEmail = 'google@example.com';
        const googleId = 'google_12345';

        const newUser = {
            _id: 'user123',
            email: googleEmail,
            googleId: googleId,
            role: 'CLIENT'
        };

        const mockToken = 'jwt_token_google';

        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(newUser);
        jwt.sign.mockReturnValue(mockToken);

        // Act
        const result = await authService.googleLogin(googleEmail, googleId);

        // Assert
        expect(userRepository.findByEmail).toHaveBeenCalledWith(googleEmail);
        expect(userRepository.create).toHaveBeenCalledWith({
            email: googleEmail,
            googleId: googleId,
            role: 'CLIENT'
        });
        expect(result).toEqual({
            user: expect.any(Object),
            token: mockToken
        });
    });
});
