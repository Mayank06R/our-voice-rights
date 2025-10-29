import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// ✅ PostgreSQL connection (Render-compatible)
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Important for Render DB SSL
  },
});

async function ingestMGNREGA() {
  try {
    const key = process.env.DATA_GOV_API_KEY;
    const resource = process.env.MGNREGA_RESOURCE_ID;

    const url = `https://api.data.gov.in/resource/${resource}?api-key=${key}&format=json&limit=1000`;
    console.log("🌐 Fetching data from:", url);

    const res = await fetch(url);
    const data = await res.json();

    if (!data.records?.length) {
      console.log("❌ No records found from API");
      return;
    }

    console.log(`📊 Total records received: ${data.records.length}`);
    console.log("🧾 Example record:", data.records[0]);

    // ✅ Filter for Maharashtra only
    const mahaRecords = data.records.filter(
      (r) => r.state_name?.toUpperCase() === "MAHARASHTRA"
    );
    console.log(`📍 Found ${mahaRecords.length} records for Maharashtra.`);

    // ✅ Create table if it doesn’t exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mgnrega_monthly (
        id SERIAL PRIMARY KEY,
        state_name TEXT,
        district_name TEXT,
        fin_year TEXT,
        month TEXT,
        average_wage_rate NUMERIC,
        average_days_employment NUMERIC,
        total_expenditure NUMERIC,
        wages_paid NUMERIC,
        women_persondays NUMERIC,
        sc_persondays NUMERIC,
        st_persondays NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (state_name, district_name, fin_year, month)
      );
    `);

    let inserted = 0;

    // ✅ Insert or update each record
    for (const r of mahaRecords) {
      const query = `
        INSERT INTO mgnrega_monthly (
          state_name, district_name, fin_year, month,
          average_wage_rate, average_days_employment,
          total_expenditure, wages_paid, women_persondays,
          sc_persondays, st_persondays
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (state_name, district_name, fin_year, month)
        DO UPDATE SET
          average_wage_rate = EXCLUDED.average_wage_rate,
          average_days_employment = EXCLUDED.average_days_employment,
          total_expenditure = EXCLUDED.total_expenditure,
          wages_paid = EXCLUDED.wages_paid,
          women_persondays = EXCLUDED.women_persondays,
          sc_persondays = EXCLUDED.sc_persondays,
          st_persondays = EXCLUDED.st_persondays;
      `;

      const values = [
        r.state_name,
        r.district_name,
        r.fin_year,
        r.month,
        Number(r.Average_Wage_rate_per_day_per_person || 0),
        Number(r.Average_days_of_employment_provided_per_Household || 0),
        Number(r.Total_Exp || 0),
        Number(r.Wages || 0),
        Number(r.Women_Persondays || 0),
        Number(r.SC_persondays || 0),
        Number(r.ST_persondays || 0),
      ];

      await pool.query(query, values);
      inserted++;
    }

    console.log(`✅ Successfully inserted/updated ${inserted} Maharashtra records.`);
  } catch (err) {
    console.error("❌ Ingest error:", err.message);
  } finally {
    await pool.end();
    console.log("🔚 Database connection closed.");
  }
}

ingestMGNREGA();
