/**
 * Tests Unitarios para productService
 * 
 * Propósito:
 * Verificar la lógica de gestión de productos (CRUD, filtros) sin
 * depender de la base de datos real.
 * 
 * Dependencias:
 * - productService: Servicio de productos principal
 * - productRepository: Mock del repositorio de productos
 * - storeRepository: Mock del repositorio de tiendas (para validación de propiedad)
 */

const productService = require('../../../src/services/productService');
const productRepository = require('../../../src/repositories/productRepository');
const storeRepository = require('../../../src/repositories/storeRepository');

// Mock de los repositorios
jest.mock('../../../src/repositories/productRepository');
jest.mock('../../../src/repositories/storeRepository');

describe('ProductService - Tests Unitarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Obtener Todos los Productos Sin Filtros
     */
    test('debe obtener todos los productos sin filtros', async () => {
        const mockProducts = [{ _id: 'prod1', name: 'P1' }, { _id: 'prod2', name: 'P2' }];
        productRepository.findAll.mockResolvedValue(mockProducts);

        const result = await productService.getAllProducts({});

        expect(productRepository.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(mockProducts);
    });

    /**
     * Test 2: Obtener Productos con Filtros
     */
    test('debe obtener productos con filtros aplicados', async () => {
        const filters = { search: 'Laptop' };
        const filteredProducts = [{ _id: 'prod3', name: 'Laptop' }];
        productRepository.findAll.mockResolvedValue(filteredProducts);

        const result = await productService.getAllProducts(filters);

        expect(productRepository.findAll).toHaveBeenCalledWith(filters);
        expect(result).toEqual(filteredProducts);
    });

    /**
     * Test 3: Obtener Producto por ID Existente
     */
    test('debe obtener producto por ID existente', async () => {
        const productId = 'prod123';
        const mockProduct = { _id: productId, name: 'Mouse' };
        productRepository.findById.mockResolvedValue(mockProduct);

        const result = await productService.getProductById(productId);

        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(result).toEqual(mockProduct);
    });

    /**
     * Test 4: Obtener Producto por ID No Existente
     */
    test('debe lanzar error si producto no existe', async () => {
        const nonExistentId = 'nonexistent123';
        productRepository.findById.mockResolvedValue(null);

        await expect(
            productService.getProductById(nonExistentId)
        ).rejects.toThrow('Producto no encontrado');
    });

    /**
     * Test 5: Crear Producto Válido
     */
    test('debe crear un nuevo producto válido', async () => {
        const userId = 'user123';
        const productData = { name: 'Teclado', price: 100 };
        const mockStore = { _id: 'store456', status: 'APPROVED', owner: userId };
        const createdProduct = { _id: 'newProd789', ...productData, store: mockStore._id };

        storeRepository.findByOwner.mockResolvedValue(mockStore);
        productRepository.create.mockResolvedValue(createdProduct);

        const result = await productService.createProduct(userId, productData);

        expect(storeRepository.findByOwner).toHaveBeenCalledWith(userId);
        expect(productRepository.create).toHaveBeenCalledWith({ ...productData, store: mockStore._id });
        expect(result).toEqual(createdProduct);
    });

    /**
     * Test 6: Actualizar Producto Existente
     */
    test('debe actualizar producto existente', async () => {
        const userId = 'user123';
        const productId = 'prod123';
        const updateData = { price: 110 };
        const mockStore = { _id: 'store456', owner: userId };
        const existingProduct = { _id: productId, name: 'Original', price: 100, store: mockStore._id };
        const updatedProduct = { ...existingProduct, ...updateData };

        productRepository.findById.mockResolvedValue(existingProduct);
        storeRepository.findByOwner.mockResolvedValue(mockStore);
        productRepository.update.mockResolvedValue(updatedProduct);

        const result = await productService.updateProduct(userId, productId, updateData);

        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(storeRepository.findByOwner).toHaveBeenCalledWith(userId);
        expect(productRepository.update).toHaveBeenCalledWith(productId, updateData);
        expect(result).toEqual(updatedProduct);
    });

    /**
     * Test 7: Eliminar Producto
     */
    test('debe eliminar producto existente', async () => {
        const userId = 'user123';
        const productId = 'prod123';
        const mockStore = { _id: 'store456', owner: userId };
        const productToDelete = { _id: productId, store: mockStore._id };

        productRepository.findById.mockResolvedValue(productToDelete);
        storeRepository.findByOwner.mockResolvedValue(mockStore);
        productRepository.delete.mockResolvedValue({ deleted: true });

        const result = await productService.deleteProduct(userId, productId);

        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(storeRepository.findByOwner).toHaveBeenCalledWith(userId);
        expect(productRepository.delete).toHaveBeenCalledWith(productId);
        expect(result).toEqual({ deleted: true });
    });
});
