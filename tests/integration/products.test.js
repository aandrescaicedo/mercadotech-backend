/**
 * Tests de Integración para Products API
 * 
 * Propósito:
 * Verificar CRUD completo de productos a través de la API
 * 
 * Dependencias:
 * - Supertest, MongoDB Memory Server
 * - Auth middleware (crear usuario y token)
 * 
 * Casos de Prueba:
 * 1-4. GET, POST, PUT, DELETE /api/v1/products
 */

const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer, authToken, userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Crear usuario y obtener token para tests autenticados
    const userData = { email: 'store@test.com', password: 'password123', role: 'STORE' };
    const authResponse = await request(app).post('/api/v1/auth/register').send(userData);
    authToken = authResponse.body.token;
    userId = authResponse.body.user.id;
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        if (key !== 'users') await collections[key].deleteMany();
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Products API - Tests de Integración', () => {
    test('GET /api/v1/products debe obtener lista de productos', async () => {
        const response = await request(app)
            .get('/api/v1/products')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/v1/products debe crear producto (autenticado)', async () => {
        const productData = {
            name: 'Laptop',
            description: 'Gaming laptop',
            price: 1500,
            stock: 10,
            category: '507f1f77bcf86cd799439011'
        };

        const response = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send(productData)
            .expect(201);

        expect(response.body.name).toBe(productData.name);
        expect(response.body.price).toBe(productData.price);
    });

    test('PUT /api/v1/products/:id debe actualizar producto', async () => {
        // Crear producto primero
        const product = (await request(app).post('/api/v1/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Mouse', price: 50, stock: 20, category: '507f1f77bcf86cd799439011' })).body;

        const updateData = { price: 45, stock: 25 };
        const response = await request(app)
            .put(`/api/v1/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body.price).toBe(45);
        expect(response.body.stock).toBe(25);
    });

    test('DELETE /api/v1/products/:id debe eliminar producto', async () => {
        const product = (await request(app).post('/api/v1/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Teclado', price: 80, stock: 15, category: '507f1f77bcf86cd799439011' })).body;

        await request(app)
            .delete(`/api/v1/products/${product._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });
});
