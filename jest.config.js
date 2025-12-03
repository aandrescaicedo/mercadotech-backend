module.exports = {
    testEnvironment: 'node',
    coverageDirectory: '../frontend/docs/test/backend/coverage',
    collectCoverageFrom: [
        'src/services/**/*.js',
        'src/repositories/**/*.js',
        '!src/**/*.test.js',
        '!src/**/index.js'
    ],
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70
        },
        './src/services/': {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70
        },
        './src/repositories/': {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70
        }
    },
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    verbose: true,
    testTimeout: 10000
};
