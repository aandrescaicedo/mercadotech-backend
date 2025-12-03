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

const authService = require('../../../src/services/authService');
const userRepository = require('../../../src/repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock del repositorio para no depender de MongoDB
jest.mock('../../../src/repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService - Tests Unitarios', () => {
    // Limpiar mocks antes de cada test para evitar interferencias
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Registro Exitoso
     */
    test('debe registrar un nuevo usuario exitosamente', async () => {
        // Arrange
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

        userRepository.findByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue(hashedPassword);
        userRepository.create.mockResolvedValue(createdUser);

        // Act
        const result = await authService.register(
            userData.email,
            userData.password,
            userData.role
        );

        // Assert
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
     */
    test('debe rechazar registro con email duplicado', async () => {
        // Arrange
        const existingUser = {
            _id: 'existing123',
            email: 'existing@example.com',
            role: 'CLIENT'
        };

        userRepository.findByEmail.mockResolvedValue(existingUser);

        // Act & Assert
        await expect(
            authService.register('existing@example.com', 'password123', 'CLIENT')
        ).rejects.toThrow('El usuario ya existe'); // Ajustado mensaje según authService.js

        expect(userRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Test 3: Login Exitoso
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
            role: 'CLIENT',
            comparePassword: jest.fn().mockResolvedValue(true) // Mock del método de instancia
        };

        const mockToken = 'jwt_token_123';

        userRepository.findByEmail.mockResolvedValue(storedUser);
        jwt.sign.mockReturnValue(mockToken);

        // Act
        const result = await authService.login(
            credentials.email,
            credentials.password
        );

        // Assert
        expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
        expect(storedUser.comparePassword).toHaveBeenCalledWith(credentials.password);
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
     */
    test('debe rechazar login con contraseña incorrecta', async () => {
        // Arrange
        const storedUser = {
            _id: 'user123',
            email: 'user@example.com',
            password: 'hashed_correct_password',
            role: 'CLIENT',
            comparePassword: jest.fn().mockResolvedValue(false)
        };

        userRepository.findByEmail.mockResolvedValue(storedUser);

        // Act & Assert
        await expect(
            authService.login('user@example.com', 'wrongPassword')
        ).rejects.toThrow('Credenciales inválidas');

        expect(jwt.sign).not.toHaveBeenCalled();
    });

    /**
     * Test 5: Google Login Simulado
     */
    test('debe crear usuario con Google Login si no existe', async () => {
        // Arrange
        const googleEmail = 'google@example.com';
        const googleId = 'google_12345';

        const newUser = {
            _id: 'user123',
            email: googleEmail,
            googleId: googleId,
            role: 'CLIENT',
            save: jest.fn()
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
