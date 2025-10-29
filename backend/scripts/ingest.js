import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// ✅ PostgreSQL connection (works both locally & on Render)
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl:
    process.env.NODE_ENV === "production"
      ? { require: true, rejectUnauthorized: false }
      : false,
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

    const mahaRecords = data.records.filter(
      (r) => r.state_name?.toUpperCase() === "MAHARASHTRA"
    );

    console.log(`📍 Found ${mahaRecords.length} records for Maharashtra.`);

    for (const r of mahaRecords) {
      await pool.query(
        `INSERT INTO mgnrega_monthly (
          fin_year, month, state_name, district_name,
          average_wage_rate, average_days_employment,
          total_expenditure, wages_paid, women_persondays,
          sc_persondays, st_persondays
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT DO NOTHING`,
        [
          r.fin_year,
          r.month,
          r.state_name,
          r.district_name,
          r.Average_Wage_rate_per_day_per_person || 0,
          r.Average_days_of_employment_provided_per_Household || 0,
          r.Total_Exp || 0,
          r.Wages || 0,
          r.Women_Persondays || 0,
          r.SC_persondays || 0,
          r.ST_persondays || 0,
        ]
      );
    }

    console.log(`✅ Inserted ${mahaRecords.length} Maharashtra records successfully!`);
  } catch (err) {
    console.error("❌ Ingest error:", err);
  } finally {
    await pool.end();
  }
}

ingestMGNREGA();
