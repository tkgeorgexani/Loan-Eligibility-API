const db = require('../config/database');

class SalaryService {
    async verifySalary(nationalId) {
        try {
            const result = await db.query(
                'SELECT monthly_salary, employer, employment_status FROM mock_salary_data WHERE national_id = $1',
                [nationalId]
            );

            if (result.rows.length === 0) {
                return {
                    found: false,
                    monthlySalary: 0,
                    employer: null,
                    employmentStatus: 'UNKNOWN'
                };
            }

            const data = result.rows[0];
            return {
                found: true,
                monthlySalary: parseFloat(data.monthly_salary),
                employer: data.employer,
                employmentStatus: data.employment_status
            };
        } catch (error) {
            throw new Error(`Salary verification failed: ${error.message}`);
        }
    }

    async addSalaryRecord(nationalId, monthlySalary, employer, employmentStatus) {
        try {
            await db.query(
                `INSERT INTO mock_salary_data (national_id, monthly_salary, employer, employment_status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (national_id) 
         DO UPDATE SET monthly_salary = $2, employer = $3, employment_status = $4`,
                [nationalId, monthlySalary, employer, employmentStatus]
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to add salary record: ${error.message}`);
        }
    }
}

module.exports = new SalaryService();
