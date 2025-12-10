const express = require('express');
const router = express.Router();
const creditService = require('../services/creditService');

/**
 * @swagger
 * /api/v1/mock/credit/{nationalId}:
 *   get:
 *     summary: Mock Credit Bureau API
 *     tags: [Mock Services]
 *     parameters:
 *       - in: path
 *         name: nationalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: boolean
 *                 creditScore:
 *                   type: integer
 *                 activeLoans:
 *                   type: integer
 *                 hasDefaults:
 *                   type: boolean
 *                 totalDebt:
 *                   type: number
 */
router.get('/credit/:nationalId', async (req, res, next) => {
    try {
        const { nationalId } = req.params;
        const data = await creditService.checkCreditHistory(nationalId);

        res.json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/mock/credit:
 *   post:
 *     summary: Add mock credit data
 *     tags: [Mock Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nationalId:
 *                 type: string
 *               creditScore:
 *                 type: integer
 *               activeLoans:
 *                 type: integer
 *               hasDefaults:
 *                 type: boolean
 *               totalDebt:
 *                 type: number
 *     responses:
 *       201:
 *         description: Credit record created
 */
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
