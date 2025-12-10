const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            error: 'Duplicate Entry',
            message: 'A record with this identifier already exists'
        });
    }

    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'External service is currently unavailable'
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message
    });
};

module.exports = errorHandler;
