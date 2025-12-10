const Joi = require('joi');

const loanApplicationSchema = Joi.object({
    nationalId: Joi.string()
        .pattern(/^[A-Z]{2}\d{9}$|^\d{9,12}$/)
        .required()
        .messages({
            'string.pattern.base': 'National ID must be in valid format',
            'any.required': 'National ID is required'
        }),

    loanAmount: Joi.number()
        .positive()
        .min(1000)
        .max(10000000)
        .required()
        .messages({
            'number.min': 'Loan amount must be at least 1,000',
            'number.max': 'Loan amount cannot exceed 10,000,000',
            'any.required': 'Loan amount is required'
        }),

    termMonths: Joi.number()
        .integer()
        .min(1)
        .max(360)
        .required()
        .messages({
            'number.min': 'Term must be at least 1 month',
            'number.max': 'Term cannot exceed 360 months',
            'any.required': 'Term in months is required'
        })
});

const validateLoanApplication = (req, res, next) => {
    const { error, value } = loanApplicationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }

    req.validatedData = value;
    next();
};

module.exports = { validateLoanApplication };
