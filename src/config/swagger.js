const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Loan Eligibility API',
            version: '1.0.0',
            description: 'API for checking loan eligibility with integrated salary and credit verification',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            schemas: {
                LoanApplication: {
                    type: 'object',
                    required: ['nationalId', 'loanAmount', 'termMonths'],
                    properties: {
                        nationalId: {
                            type: 'string',
                            description: 'National ID of the applicant',
                            example: 'ID123456789'
                        },
                        loanAmount: {
                            type: 'number',
                            description: 'Requested loan amount',
                            example: 50000
                        },
                        termMonths: {
                            type: 'integer',
                            description: 'Loan term in months',
                            example: 12
                        }
                    }
                },
                EligibilityResponse: {
                    type: 'object',
                    properties: {
                        eligible: {
                            type: 'boolean',
                            description: 'Whether the applicant is eligible'
                        },
                        applicationId: {
                            type: 'string',
                            description: 'Unique application identifier'
                        },
                        decision: {
                            type: 'object',
                            properties: {
                                approved: {
                                    type: 'boolean'
                                },
                                reasons: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    }
                                },
                                details: {
                                    type: 'object',
                                    properties: {
                                        monthlySalary: { type: 'number' },
                                        monthlyRepayment: { type: 'number' },
                                        creditScore: { type: 'integer' },
                                        activeLoans: { type: 'integer' },
                                        hasDefaults: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
