const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await db.query('SELECT NOW()');
        console.log('Database connection established');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
