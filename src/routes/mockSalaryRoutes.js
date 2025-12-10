const express = require('express');
const router = express.Router();
const salaryService = require('../services/salaryService');

/**
 * @swagger
 * /api/v1/mock/salary/{nationalId}:
 *   get:
 *     summary: Mock Salary Verification API
 *     tags: [Mock Services]
 *     parameters:
 *       - in: path
 *         name: nationalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Salary information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: boolean
 *                 monthlySalary:
 *                   type: number
 *                 employer:
 *                   type: string
 *                 employmentStatus:
 *                   type: string
 */
router.get('/salary/:nationalId', async (req, res, next) => {
    try {
        const { nationalId } = req.params;
        const data = await salaryService.verifySalary(nationalId);

        res.json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/mock/salary:
 *   post:
 *     summary: Add mock salary data
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
 *               monthlySalary:
 *                 type: number
 *               employer:
 *                 type: string
 *               employmentStatus:
 *                 type: string
 *     responses:
 *       201:
 *         description: Salary record created
 */
router.post('/salary', async (req, res, next) => {
    try {
        const { nationalId, monthlySalary, employer, employmentStatus } = req.body;


        await salaryService.addSalaryRecord(
            nationalId,
            monthlySalary,
            employer,
            employmentStatus
        );

        res.status(201).json({
            message: 'Salary record added successfully',
            nationalId
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
