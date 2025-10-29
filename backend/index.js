import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

/**
 * ✅ PostgreSQL connection (auto-detects environment)
 */
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
      }
);

pool
  .connect()
  .then(() =>
    console.log(
      `🟢 Connected to PostgreSQL (${isProduction ? "Render Cloud" : "Local Dev"})`
    )
  )
  .catch((err) =>
    console.error("🔴 PostgreSQL connection error:", err.message)
  );

const PORT = process.env.PORT || 3000;

/**
 * 🧠 Utility: Fetch latest MGNREGA data from data.gov.in API
 */
async function fetchMGNREGAData(limit = 1000) {
  const key = process.env.DATA_GOV_API_KEY;
  const resource = process.env.MGNREGA_RESOURCE_ID;

  const queryParams = new URLSearchParams({
    "api-key": key,
    format: "json",
    limit,
  });

  const url = `https://api.data.gov.in/resource/${resource}?${queryParams.toString()}`;
  console.log("🌐 Fetching from:", url);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();

  return data.records || [];
}

/**
 * ✅ Route: Get All Districts (Maharashtra Only)
 */
app.get("/api/v1/districts", async (req, res) => {
  try {
    const records = await fetchMGNREGAData(1000);
    if (!records.length)
      return res.status(404).json({ message: "No district data found" });

    // ✅ Filter only Maharashtra districts
    const mahaDistricts = records
      .filter((r) => r.state_name?.toUpperCase() === "MAHARASHTRA")
      .map((r) => ({
        state: r.state_name,
        district: r.district_name,
      }));

    // ✅ Remove duplicates and sort alphabetically
    const uniqueDistricts = Array.from(
      new Map(mahaDistricts.map((d) => [d.district, d])).values()
    ).sort((a, b) => a.district.localeCompare(b.district));

    res.json(uniqueDistricts);
  } catch (err) {
    console.error("❌ Error in /districts:", err.message);
    res.status(500).json({ error: "Failed to fetch district list" });
  }
});

/**
 * ✅ Route: Get Performance for a Specific District
 */
app.get("/api/v1/performance", async (req, res) => {
  try {
    let { state, district } = req.query;
    if (!state || !district)
      return res
        .status(400)
        .json({ error: "Both 'state' and 'district' are required" });

    state = state.trim().toUpperCase();
    district = district.trim().toUpperCase();

    const records = await fetchMGNREGAData(1000);
    if (!records.length)
      return res.status(404).json({ message: "No records found in dataset" });

    const match = records.find(
      (r) =>
        r.state_name?.toUpperCase() === state &&
        r.district_name?.toUpperCase().includes(district)
    );

    if (!match)
      return res.status(404).json({ message: "No data found for this district" });

    const result = {
      state: match.state_name,
      district: match.district_name,
      fin_year: match.fin_year || "N/A",
      month: match.month || "N/A",
      approved_labour_budget: match.Approved_Labour_Budget || "N/A",
      average_wage_rate: match.Average_Wage_rate_per_day_per_person || "N/A",
      average_days_employment:
        match.Average_days_of_employment_provided_per_Household || "N/A",
      total_active_jobcards: match.Total_No_of_Active_Job_Cards || "N/A",
      total_active_workers: match.Total_No_of_Active_Workers || "N/A",
      total_jobcards_issued: match.Total_No_of_JobCards_issued || "N/A",
      total_workers: match.Total_No_of_Workers || "N/A",
      total_households_worked: match.Total_Households_Worked || "N/A",
      total_expenditure: match.Total_Exp || "N/A",
      wages_paid: match.Wages || "N/A",
      women_persondays: match.Women_Persondays || "N/A",
      completed_works: match.Number_of_Completed_Works || "N/A",
      ongoing_works: match.Number_of_Ongoing_Works || "N/A",
      percent_agriculture_exp:
        match.percent_of_Expenditure_on_Agriculture_Allied_Works || "N/A",
      sc_persondays: match.SC_persondays || "N/A",
      st_persondays: match.ST_persondays || "N/A",
      remarks: match.Remarks || "N/A",
    };

    res.json(result);
  } catch (err) {
    console.error("❌ Error in /performance:", err.message);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
});

/**
 * 📊 Route: Get History for a Specific District (last 12 months from DB)
 */
app.get("/api/v1/history", async (req, res) => {
  try {
    const { state, district } = req.query;
    if (!state || !district)
      return res
        .status(400)
        .json({ message: "Both 'state' and 'district' parameters are required" });

    const query = `
      SELECT fin_year, month, average_wage_rate, average_days_employment,
             total_expenditure, wages_paid, women_persondays,
             sc_persondays, st_persondays
      FROM mgnrega_monthly
      WHERE state_name ILIKE $1 AND district_name ILIKE $2
      ORDER BY id DESC
      LIMIT 12;
    `;

    const dbResult = await pool.query(query, [state, `%${district}%`]);

    if (dbResult.rows.length === 0)
      return res.status(404).json({ message: "No history data found" });

    const ordered = dbResult.rows.reverse(); // oldest → newest

    res.json({
      district: district.toUpperCase(),
      months: ordered.map((r) => `${r.month} ${r.fin_year}`),
      data: ordered,
    });
  } catch (err) {
    console.error("❌ Error fetching /history:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * ✅ Health Check Route
 */
app.get("/", (req, res) => {
  res.send("✅ Our Voice Backend is running with live + cached MGNREGA data!");
});

/**
 * ✅ Start Server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

import cron from "node-cron";
import { exec } from "child_process";

// Runs once a day at 8 AM IST
cron.schedule("30 2 * * *", () => {
  console.log("⚙️ Running daily data ingestion...");
  exec("npm run ingest", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Ingest error:", error);
      return;
    }
    console.log("✅ Ingest output:", stdout);
    if (stderr) console.error(stderr);
  });
});
