/**
 * Tests de Integración para Auth API
 * 
 * Propósito:
 * Verificar que los endpoints de autenticación funcionen correctamente
 * de punta a punta (request → routing → controller → service → repository).
 * 
 * Dependencias:
 * - Supertest: Para hacer requests HTTP a la API
 * - Express app: La aplicación completa
 * - MongoDB Memory Server: Base de datos en memoria para testing
 * 
 * Casos de Prueba:
 * 1. POST /api/v1/auth/register - Registro exitoso
 * 2. POST /api/v1/auth/login - Login exitoso
 * 3. POST /api/v1/auth/google - Google login simulado
 */

const request = require('supertest');
const app = require('../../src/app'); // Asumiendo que app está exportado
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configurar base de datos en memoria antes de todos los tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Limpiar después de cada test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Auth API - Tests de Integración', () => {
    /**
     * Test 1: POST /api/v1/auth/register - Registro Exitoso
     * 
     * Qué prueba:
     * - El endpoint puede crear un nuevo usuario
     * - Retorna 201 Created
     * - Retorna usuario y token JWT
     * 
     * Dependencias:
     * - API completa funcionando
     * - MongoDB en memoria
     * - Todos los middlewares activos
     */
    test('POST /api/v1/auth/register debe crear nuevo usuario', async () => {
        // Arrange
        const newUser = {
            email: 'newuser@example.com',
            password: 'securePassword123',
            role: 'CLIENT'
        };

        // Act
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(newUser)
            .expect('Content-Type', /json/)
            .expect(201);

        // Assert
        expect(response.body).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(newUser.email);
        expect(response.body.user.role).toBe(newUser.role);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.password).toBeUndefined(); // Password no debe incluirse
    });

    /**
     * Test 2: POST /api/v1/auth/login - Login Exitoso
     * 
     * Qué prueba:
     * - El endpoint puede autenticar usuario existente
     * - Retorna 200 OK
     * - Retorna token JWT válido
     * 
     * Dependencias:
     * - Usuario previamente registrado en DB
     * - Endpoints register y login funcionando
     */
    test('POST /api/v1/auth/login debe autenticar usuario válido', async () => {
        // Arrange - Primero registrar usuario
        const userData = {
            email: 'login@example.com',
            password: 'myPassword123',
            role: 'CLIENT'
        };

        await request(app)
            .post('/api/v1/auth/register')
            .send(userData);

        // Act - Intentar login
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect('Content-Type', /json/)
            .expect(200);

        // Assert
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe('string');
    });

    /**
     * Test 3: POST /api/v1/auth/google - Google Login Simulado
     * 
     * Qué prueba:
     * - El endpoint puede autenticar con Google (simulado)
     * - Crea usuario nuevo si no existe
     * - Retorna token JWT
     * 
     * Dependencias:
     * -Endpoint de Google login implementado
     * - MongoDB en memoria
     */
    test('POST /api/v1/auth/google debe autenticar con Google', async () => {
        // Arrange
        const googleData = {
            email: 'google@example.com',
            googleId: 'google_unique_id_123'
        };

        // Act
        const response = await request(app)
            .post('/api/v1/auth/google')
            .send(googleData)
            .expect('Content-Type', /json/)
            .expect(200);

        // Assert
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(googleData.email);
        expect(response.body.token).toBeDefined();
    });
});
