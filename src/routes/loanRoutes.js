const express = require('express');
const router = express.Router();
const loanService = require('../services/loanService');
const { validateLoanApplication } = require('../middleware/validation');

/**
 * @swagger
 * /api/v1/loans/apply:
 *   post:
 *     summary: Submit a loan application
 *     tags: [Loan Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanApplication'
 *     responses:
 *       200:
 *         description: Application processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EligibilityResponse'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/apply', validateLoanApplication, async (req, res, next) => {
    try {
        const { nationalId, loanAmount, termMonths } = req.validatedData;

        const decision = await loanService.evaluateEligibility(
            nationalId,
            loanAmount,
            termMonths
        );

        const applicationId = await loanService.saveApplication(
            nationalId,
            loanAmount,
            termMonths,
            decision
        );

        res.json({
            applicationId,
            eligible: decision.eligible,
            decision: {
                approved: decision.eligible,
                reasons: decision.reasons,
                details: decision.details
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/loans/history/{nationalId}:
 *   get:
 *     summary: Get application history for a national ID
 *     tags: [Loan Applications]
 *     parameters:
 *       - in: path
 *         name: nationalId
 *         required: true
 *         schema:
 *           type: string
 *         description: National ID of the applicant
 *     responses:
 *       200:
 *         description: Application history retrieved
 *       404:
 *         description: No applications found
 */
router.get('/history/:nationalId', async (req, res, next) => {
    try {
        const { nationalId } = req.params;
        const history = await loanService.getApplicationHistory(nationalId);

        res.json({
            nationalId,
            totalApplications: history.length,
            applications: history
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
