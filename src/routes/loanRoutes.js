const express = require('express');
const router = express.Router();
const loanService = require('../services/loanService');
const { validateLoanApplication } = require('../middleware/validation');


 // /api/v1/loans/apply:summary: Submit a loan application
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


 // /api/v1/loans/history/{nationalId}: Get application history for a national ID
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
