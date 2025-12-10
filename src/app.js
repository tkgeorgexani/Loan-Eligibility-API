const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const loanRoutes = require('./routes/loanRoutes');
const mockSalaryRoutes = require('./routes/mockSalaryRoutes');
const mockCreditRoutes = require('./routes/mockCreditRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.json({
        message: 'Loan Eligibility API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            loanApplication: '/api/v1/loans/apply',
            applicationHistory: '/api/v1/loans/history/:nationalId',
            mockSalary: '/api/v1/mock/salary/:nationalId',
            mockCredit: '/api/v1/mock/credit/:nationalId'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Loan Eligibility API Documentation'
}));

app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/mock', mockSalaryRoutes);
app.use('/api/v1/mock', mockCreditRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

app.use(errorHandler);

module.exports = app;
