const express = require('express');
const router = express.Router();
const creditService = require('../services/creditService');


 // /api/v1/mock/credit/{nationalId}: summary: Mock Credit Bureau API

router.get('/credit/:nationalId', async (req, res, next) => {
    try {
        const { nationalId } = req.params;
        const data = await creditService.checkCreditHistory(nationalId);

        res.json(data);
    } catch (error) {
        next(error);
    }
});


 // /api/v1/mock/credit: summary: Add mock credit data

router.post('/credit', async (req, res, next) => {
    try {
        const { nationalId, creditScore, activeLoans, hasDefaults, totalDebt } = req.body;

        await creditService.addCreditRecord(
            nationalId,
            creditScore,
            activeLoans,
            hasDefaults,
            totalDebt
        );

        res.status(201).json({
            message: 'Credit record added successfully',
            nationalId
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
