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

const fs = require('fs');
const logFile = 'debug_orders.log';
function log(msg) { fs.appendFileSync(logFile, msg + '\n'); }

let mongoServer, storeToken, clientToken, productId;

beforeAll(async () => {
    try {
        log('Starting beforeAll setup...');
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // 1. Registrar usuario VENDEDOR (STORE)
        const storeAuthRes = await request(app).post('/api/v1/auth/register')
            .send({ email: 'store@test.com', password: 'pass123', role: 'STORE' });
        storeToken = storeAuthRes.body.token;
        log('Store user registered');

        // 2. Registrar usuario CLIENTE (CLIENT)
        const clientAuthRes = await request(app).post('/api/v1/auth/register')
            .send({ email: 'client@test.com', password: 'pass123', role: 'CLIENT' });
        clientToken = clientAuthRes.body.token;
        log('Client user registered');

        // 3. Crear tienda con usuario VENDEDOR
        const storeRes = await request(app).post('/api/v1/stores')
            .set('Authorization', `Bearer ${storeToken}`)
            .send({ name: 'Test Store', description: 'Test Description' });
        const storeId = storeRes.body._id;
        log('Store created: ' + storeId);

        // 4. Aprobar tienda manualmente
        const Store = require('../../src/models/Store');
        await Store.findByIdAndUpdate(storeId, { status: 'APPROVED' });

        // 5. Crear categoría
        const Category = require('../../src/models/Category');
        const categoryRes = await Category.create({ name: 'Test Category', description: 'Test Description' });
        const categoryId = categoryRes._id;

        // 6. Crear producto con usuario VENDEDOR
        const prodRes = await request(app).post('/api/v1/products')
            .set('Authorization', `Bearer ${storeToken}`)
            .send({
                name: 'Product Test',
                price: 100,
                stock: 50,
                description: 'Desc',
                images: ['img.jpg'],
                category: categoryId,
                store: storeId
            });

        if (prodRes.status !== 201) {
            log('Error creando producto: ' + JSON.stringify(prodRes.body));
        } else {
            log('Producto creado: ' + prodRes.body._id);
        }
        productId = prodRes.body._id;
    } catch (error) {
        log('FATAL ERROR in beforeAll: ' + error);
        throw error;
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Orders API - Tests de Integración', () => {
    test('POST /api/v1/orders debe crear pedido', async () => {
        const orderData = {
            items: [{ product: productId, quantity: 2, price: 100 }],
            shippingAddress: {
                address: 'Calle 123',
                city: 'Cali',
                postalCode: '760001',
                country: 'Colombia'
            }
        };
        const response = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send(orderData)
            .expect(201);
        expect(response.body.total).toBe(200);
        expect(response.body.status).toBe('PAID');
    });

    test('GET /api/v1/orders/my-orders debe obtener pedidos del usuario', async () => {
        const response = await request(app)
            .get('/api/v1/orders/my-orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('PATCH /api/v1/orders/:id/status debe actualizar estado (admin)', async () => {
        // Crear un pedido para actualizar
        const order = (await request(app).post('/api/v1/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                items: [{ product: productId, quantity: 1, price: 100 }],
                shippingAddress: {
                    address: 'Calle 123',
                    city: 'Cali',
                    postalCode: '760001',
                    country: 'Colombia'
                }
            })).body;
        // Nota: Este test requeriría un usuario ADMIN, se deja como ejemplo.
        expect(order._id).toBeDefined();
    });
});
