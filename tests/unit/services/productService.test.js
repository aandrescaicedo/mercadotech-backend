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
 * 
 * Casos de Prueba:
 * 1. Obtener todos los productos sin filtros
 * 2. Obtener productos con filtros (nombre, categoría, precio)
 * 3. Obtener producto por ID existente
 * 4. Obtener producto por ID no existente (debe lanzar error)
 * 5. Crear producto válido
 * 6. Actualizar product existente
 * 7. Eliminar producto existente
 */

const productService = require('../../src/services/productService');
const productRepository = require('../../src/repositories/productRepository');

// Mock del repositorio
jest.mock('../../src/repositories/productRepository');

describe('ProductService - Tests Unitarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test 1: Obtener Todos los Productos Sin Filtros
     * 
     * Qué prueba:
     * - El servicio puede obtener lista completa de productos
     * - Retorna array de productos
     * 
     * Dependencias mockeadas:
     * - productRepository.findAll: Retorna array de productos
     */
    test('debe obtener todos los productos sin filtros', async () => {
        // Arrange
        const mockProducts = [
            {
                _id: 'prod1',
                name: 'Producto 1',
                price: 100,
                category: 'cat1',
                stock: 10
            },
            {
                _id: 'prod2',
                name: 'Producto 2',
                price: 200,
                category: 'cat2',
                stock: 5
            }
        ];

        productRepository.findAll.mockResolvedValue(mockProducts);

        // Act
        const result = await productService.getAllProducts({});

        // Assert
        expect(productRepository.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(mockProducts);
        expect(result).toHaveLength(2);
    });

    /**
     * Test 2: Obtener Productos con Filtros
     * 
     * Qué prueba:
     * - El servicio aplica filtros correctamente (search, category, price range)
     * - Los filtros se pasan al repositorio
     * 
     * Dependencias mockeadas:
     * - productRepository.findAll: Retorna productos filtrados
     */
    test('debe obtener productos con filtros aplicados', async () => {
        // Arrange
        const filters = {
            search: 'Laptop',
            category: 'electronics',
            minPrice: 500,
            maxPrice: 2000
        };

        const filteredProducts = [
            {
                _id: 'prod3',
                name: 'Laptop Dell',
                price: 1500,
                category: 'electronics',
                stock: 3
            }
        ];

        productRepository.findAll.mockResolvedValue(filteredProducts);

        // Act
        const result = await productService.getAllProducts(filters);

        // Assert
        expect(productRepository.findAll).toHaveBeenCalledWith(filters);
        expect(result).toEqual(filteredProducts);
    });

    /**
     * Test 3: Obtener Producto por ID Existente
     * 
     * Qué prueba:
     * - El servicio puede obtener un producto específico por ID
     * - Retorna el producto completo
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna producto
     */
    test('debe obtener producto por ID existente', async () => {
        // Arrange
        const productId = 'prod123';
        const mockProduct = {
            _id: productId,
            name: 'Mouse Gamer',
            price: 50,
            category: 'tech',
            stock: 20
        };

        productRepository.findById.mockResolvedValue(mockProduct);

        // Act
        const result = await productService.getProductById(productId);

        // Assert
        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(result).toEqual(mockProduct);
    });

    /**
     * Test 4: Obtener Producto por ID No Existente
     * 
     * Qué prueba:
     * - El servicio lanza error cuando el producto no existe
     * - Mensaje de error apropiado
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna null
     */
    test('debe lanzar error si producto no existe', async () => {
        // Arrange
        const nonExistentId = 'nonexistent123';
        productRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(
            productService.getProductById(nonExistentId)
        ).rejects.toThrow('Producto no encontrado');

        expect(productRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    /**
     * Test 5: Crear Producto Válido
     * 
     * Qué prueba:
     * - El servicio puede crear un nuevo producto
     * - Se retorna el producto creado
     * 
     * Dependencias mockeadas:
     * - productRepository.create: Simula creación en DB
     */
    test('debe crear un nuevo producto válido', async () => {
        // Arrange
        const productData = {
            name: 'Teclado Mecánico',
            description: 'Teclado RGB con switches azules',
            price: 120,
            stock: 15,
            category: 'tech123',
            store: 'store456',
            images: ['url1.jpg', 'url2.jpg']
        };

        const createdProduct = {
            _id: 'newProd789',
            ...productData
        };

        productRepository.create.mockResolvedValue(createdProduct);

        // Act
        const result = await productService.createProduct(productData);

        // Assert
        expect(productRepository.create).toHaveBeenCalledWith(productData);
        expect(result).toEqual(createdProduct);
        expect(result._id).toBeDefined();
    });

    /**
     * Test 6: Actualizar Producto Existente
     * 
     * Qué prueba:
     * - El servicio puede actualizar un producto existente
     * - Solo los campos proporcionados se actualizan
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Retorna producto existente
     * - productRepository.update: Simula actualización
     */
    test('debe actualizar producto existente', async () => {
        // Arrange
        const productId = 'prod123';
        const updateData = {
            price: 110, // Precio actualizado
            stock: 25  // Stock actualizado
        };

        const existingProduct = {
            _id: productId,
            name: 'Producto Original',
            price: 100,
            stock: 20
        };

        const updatedProduct = {
            ...existingProduct,
            ...updateData
        };

        productRepository.findById.mockResolvedValue(existingProduct);
        productRepository.update.mockResolvedValue(updatedProduct);

        // Act
        const result = await productService.updateProduct(productId, updateData);

        // Assert
        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(productRepository.update).toHaveBeenCalledWith(productId, updateData);
        expect(result.price).toBe(110);
        expect(result.stock).toBe(25);
    });

    /**
     * Test 7: Eliminar Producto
     * 
     * Qué prueba:
     * - El servicio puede eliminar un producto existente
     * - Retorna confirmación de eliminación
     * 
     * Dependencias mockeadas:
     * - productRepository.findById: Verifica que existe
     * - productRepository.delete: Simula eliminación
     */
    test('debe eliminar producto existente', async () => {
        // Arrange
        const productId = 'prod123';
        const productToDelete = {
            _id: productId,
            name: 'Producto a Eliminar'
        };

        productRepository.findById.mockResolvedValue(productToDelete);
        productRepository.delete.mockResolvedValue({ deleted: true });

        // Act
        const result = await productService.deleteProduct(productId);

        // Assert
        expect(productRepository.findById).toHaveBeenCalledWith(productId);
        expect(productRepository.delete).toHaveBeenCalledWith(productId);
        expect(result).toEqual({ deleted: true });
    });
});
