const db = require('../config/database');

class CreditService {
    async checkCreditHistory(nationalId) {
        try {
            const result = await db.query(
                `SELECT credit_score, active_loans, has_defaults, total_debt 
         FROM mock_credit_data 
         WHERE national_id = $1`,
                [nationalId]
            );

            if (result.rows.length === 0) {
                return {
                    found: false,
                    creditScore: 0,
                    activeLoans: 0,
                    hasDefaults: true,
                    totalDebt: 0
                };
            }

            const data = result.rows[0];
            return {
                found: true,
                creditScore: data.credit_score,
                activeLoans: data.active_loans,
                hasDefaults: data.has_defaults,
                totalDebt: parseFloat(data.total_debt)
            };
        } catch (error) {
            throw new Error(`Credit check failed: ${error.message}`);
        }
    }

    async addCreditRecord(nationalId, creditScore, activeLoans, hasDefaults, totalDebt) {
        try {
            await db.query(
                `INSERT INTO mock_credit_data (national_id, credit_score, active_loans, has_defaults, total_debt)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (national_id) 
         DO UPDATE SET credit_score = $2, active_loans = $3, has_defaults = $4, total_debt = $5`,
                [nationalId, creditScore, activeLoans, hasDefaults, totalDebt]
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to add credit record: ${error.message}`);
        }
    }
}

module.exports = new CreditService();
