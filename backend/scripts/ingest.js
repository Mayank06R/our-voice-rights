import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// ✅ PostgreSQL connection
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function ingestMGNREGA() {
  try {
    const key = process.env.DATA_GOV_API_KEY;
    const resource = process.env.MGNREGA_RESOURCE_ID;
    const url = `https://api.data.gov.in/resource/${resource}?api-key=${key}&format=json&limit=1000`;

    console.log("🌐 Fetching Maharashtra data...");
    const res = await fetch(url);
    const data = await res.json();
    if (!data.records?.length) {
      console.log("❌ No records found from API");
      return;
    }

    const mahaRecords = data.records.filter(
      (r) => r.state_name?.toUpperCase() === "MAHARASHTRA"
    );

    for (const r of mahaRecords) {
      const q = `
        INSERT INTO mgnrega_monthly (
          fin_year, month, state_name, district_name,
          approved_labour_budget, average_wage_rate,
          average_days_employment, total_active_jobcards,
          total_active_workers, total_households_worked,
          total_expenditure, wages_paid, women_persondays,
          sc_persondays, st_persondays
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (state_name, district_name, fin_year, month)
        DO UPDATE SET
          approved_labour_budget = EXCLUDED.approved_labour_budget,
          average_wage_rate = EXCLUDED.average_wage_rate,
          average_days_employment = EXCLUDED.average_days_employment,
          total_active_jobcards = EXCLUDED.total_active_jobcards,
          total_active_workers = EXCLUDED.total_active_workers,
          total_households_worked = EXCLUDED.total_households_worked,
          total_expenditure = EXCLUDED.total_expenditure,
          wages_paid = EXCLUDED.wages_paid,
          women_persondays = EXCLUDED.women_persondays,
          sc_persondays = EXCLUDED.sc_persondays,
          st_persondays = EXCLUDED.st_persondays,
          last_synced = NOW();
      `;
      const values = [
        r.fin_year,
        r.month,
        r.state_name,
        r.district_name,
        r.Approved_Labour_Budget || 0,
        r.Average_Wage_rate_per_day_per_person || 0,
        r.Average_days_of_employment_provided_per_Household || 0,
        r.Total_No_of_Active_Job_Cards || 0,
        r.Total_No_of_Active_Workers || 0,
        r.Total_Households_Worked || 0,
        r.Total_Exp || 0,
        r.Wages || 0,
        r.Women_Persondays || 0,
        r.SC_persondays || 0,
        r.ST_persondays || 0,
      ];
      await pool.query(q, values);
    }

    console.log(`✅ Inserted/Updated ${mahaRecords.length} Maharashtra records.`);
  } catch (err) {
    console.error("❌ Ingest error:", err);
  } finally {
    await pool.end();
  }
}

ingestMGNREGA();
