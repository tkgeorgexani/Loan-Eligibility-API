const db = require('../config/database');
const salaryService = require('./salaryService');
const creditService = require('./creditService');

class LoanService {
    constructor() {
        this.MIN_CREDIT_SCORE = parseInt(process.env.MIN_CREDIT_SCORE) || 600;
        this.MAX_ACTIVE_LOANS = parseInt(process.env.MAX_ACTIVE_LOANS) || 3;
        this.SALARY_MULTIPLIER = parseInt(process.env.SALARY_MULTIPLIER) || 3;
    }

    calculateMonthlyRepayment(loanAmount, termMonths) {
        const annualRate = 0.12;
        const monthlyRate = annualRate / 12;

        if (monthlyRate === 0) {
            return loanAmount / termMonths;
        }

        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1);

        return Math.round(monthlyPayment * 100) / 100;
    }

    async evaluateEligibility(nationalId, loanAmount, termMonths) {
        const reasons = [];
        const monthlyRepayment = this.calculateMonthlyRepayment(loanAmount, termMonths);

        const [salaryData, creditData] = await Promise.all([
            salaryService.verifySalary(nationalId),
            creditService.checkCreditHistory(nationalId)
        ]);

        if (!salaryData.found) {
            reasons.push('Salary information not found in our records');
        }

        if (!creditData.found) {
            reasons.push('Credit history not found in our records');
        }

        const requiredMonthlySalary = monthlyRepayment * this.SALARY_MULTIPLIER;
        if (salaryData.monthlySalary < requiredMonthlySalary) {
            reasons.push(
                `Monthly salary (${salaryData.monthlySalary}) is below required minimum (${requiredMonthlySalary.toFixed(2)})`
            );
        }

        if (creditData.creditScore < this.MIN_CREDIT_SCORE) {
            reasons.push(
                `Credit score (${creditData.creditScore}) is below minimum requirement (${this.MIN_CREDIT_SCORE})`
            );
        }

        if (creditData.hasDefaults) {
            reasons.push('Active defaults found on credit record');
        }

        if (creditData.activeLoans > this.MAX_ACTIVE_LOANS) {
            reasons.push(
                `Too many active loans (${creditData.activeLoans}), maximum allowed is ${this.MAX_ACTIVE_LOANS}`
            );
        }

        const eligible = reasons.length === 0;

        return {
            eligible,
            monthlyRepayment,
            reasons,
            details: {
                monthlySalary: salaryData.monthlySalary,
                monthlyRepayment,
                requiredMonthlySalary,
                creditScore: creditData.creditScore,
                activeLoans: creditData.activeLoans,
                hasDefaults: creditData.hasDefaults,
                employer: salaryData.employer,
                employmentStatus: salaryData.employmentStatus
            }
        };
    }

    async saveApplication(nationalId, loanAmount, termMonths, decision) {
        const applicationId = this.generateApplicationId();

        await db.query(
            `INSERT INTO loan_applications 
       (application_id, national_id, loan_amount, term_months, monthly_repayment, eligible, decision)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                applicationId,
                nationalId,
                loanAmount,
                termMonths,
                decision.monthlyRepayment,
                decision.eligible,
                JSON.stringify(decision)
            ]
        );

        return applicationId;
    }

    generateApplicationId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `LA-${timestamp}-${random}`;
    }

    async getApplicationHistory(nationalId) {
        const result = await db.query(
            `SELECT application_id, loan_amount, term_months, eligible, decision, created_at
       FROM loan_applications
       WHERE national_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
            [nationalId]
        );

        return result.rows.map(row => ({
            applicationId: row.application_id,
            loanAmount: parseFloat(row.loan_amount),
            termMonths: row.term_months,
            eligible: row.eligible,
            decision: row.decision,
            appliedAt: row.created_at
        }));
    }
}

module.exports = new LoanService();
