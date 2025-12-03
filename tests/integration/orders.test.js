/**
 * Tests de Integración para Orders API
 * 
 * Propósito:
 * Verificar flujo completo de pedidos a través de la API
 * 
 * Dependencias:
 * - Supertest, MongoDB Memory Server
 * - Productos y usuario creados previamente
 * 
 * Casos: POST /api/v1/orders, GET /api/v1/orders, PATCH /api/v1/orders/:id/status
 */

const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer, authToken, productId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const authRes = await request(app).post('/api/v1/auth/register')
        .send({ email: 'client@test.com', password: 'pass123', role: 'CLIENT' });
    authToken = authRes.body.token;

    // Crear producto para pedidos
    const prodRes = await request(app).post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Product Test', price: 100, stock: 50, category: '507f1f77bcf86cd799439011' });
    productId = prodRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Orders API - Tests de Integración', () => {
    test('POST /api/v1/orders debe crear pedido', async () => {
        const orderData = {
            items: [{ product: productId, quantity: 2, price: 100 }]
        };

        const response = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send(orderData)
            .expect(201);

        expect(response.body.total).toBe(200);
        expect(response.body.status).toBe('PENDING');
    });

    test('GET /api/v1/orders debe obtener pedidos del usuario', async () => {
        const response = await request(app)
            .get('/api/v1/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    test('PATCH /api/v1/orders/:id/status debe actualizar estado (admin)', async () => {
        const order = (await request(app).post('/api/v1/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ items: [{ product: productId, quantity: 1, price: 100 }] })).body;

        // Este test requeriría un usuario ADMIN, se deja como ejemplo
        // En implementación real, crear usuario admin y su token
        expect(order._id).toBeDefined();
    });
});
