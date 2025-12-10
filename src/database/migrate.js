const db = require('../config/database');

const createTables = async () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS loan_applications (
      id SERIAL PRIMARY KEY,
      application_id VARCHAR(50) UNIQUE NOT NULL,
      national_id VARCHAR(50) NOT NULL,
      loan_amount DECIMAL(12, 2) NOT NULL,
      term_months INTEGER NOT NULL,
      monthly_repayment DECIMAL(12, 2) NOT NULL,
      eligible BOOLEAN NOT NULL,
      decision JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

        `CREATE INDEX IF NOT EXISTS idx_national_id ON loan_applications(national_id)`,
        `CREATE INDEX IF NOT EXISTS idx_created_at ON loan_applications(created_at)`,

        `CREATE TABLE IF NOT EXISTS mock_salary_data (
      id SERIAL PRIMARY KEY,
      national_id VARCHAR(50) UNIQUE NOT NULL,
      monthly_salary DECIMAL(12, 2) NOT NULL,
      employer VARCHAR(255),
      employment_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

        `CREATE TABLE IF NOT EXISTS mock_credit_data (
      id SERIAL PRIMARY KEY,
      national_id VARCHAR(50) UNIQUE NOT NULL,
      credit_score INTEGER NOT NULL,
      active_loans INTEGER DEFAULT 0,
      has_defaults BOOLEAN DEFAULT false,
      total_debt DECIMAL(12, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
    ];

    try {
        for (const query of queries) {
            await db.query(query);
        }
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};

const seedMockData = async () => {
    const salaryData = [
        { nationalId: 'ID123456789', monthlySalary: 150000, employer: 'Tech Corp', status: 'PERMANENT' },
        { nationalId: 'ID987654321', monthlySalary: 80000, employer: 'Retail Ltd', status: 'PERMANENT' },
        { nationalId: 'ID555666777', monthlySalary: 45000, employer: 'Small Business', status: 'CONTRACT' },
        { nationalId: 'ID111222333', monthlySalary: 200000, employer: 'Finance Inc', status: 'PERMANENT' },
        { nationalId: 'ID444555666', monthlySalary: 30000, employer: 'Startup Co', status: 'PROBATION' }
    ];

    const creditData = [
        { nationalId: 'ID123456789', creditScore: 750, activeLoans: 1, hasDefaults: false, totalDebt: 100000 },
        { nationalId: 'ID987654321', creditScore: 620, activeLoans: 2, hasDefaults: false, totalDebt: 200000 },
        { nationalId: 'ID555666777', creditScore: 580, activeLoans: 3, hasDefaults: true, totalDebt: 150000 },
        { nationalId: 'ID111222333', creditScore: 800, activeLoans: 0, hasDefaults: false, totalDebt: 0 },
        { nationalId: 'ID444555666', creditScore: 650, activeLoans: 4, hasDefaults: false, totalDebt: 300000 }
    ];

    try {
        for (const data of salaryData) {
            await db.query(
                `INSERT INTO mock_salary_data (national_id, monthly_salary, employer, employment_status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (national_id) DO NOTHING`,
                [data.nationalId, data.monthlySalary, data.employer, data.status]
            );
        }

        for (const data of creditData) {
            await db.query(
                `INSERT INTO mock_credit_data (national_id, credit_score, active_loans, has_defaults, total_debt)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (national_id) DO NOTHING`,
                [data.nationalId, data.creditScore, data.activeLoans, data.hasDefaults, data.totalDebt]
            );
        }

        console.log('Mock data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
};

const migrate = async () => {
    try {
        await createTables();
        await seedMockData();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    migrate();
}

module.exports = { createTables, seedMockData };
