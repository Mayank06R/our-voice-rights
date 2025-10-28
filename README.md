# 🗳️ Our Voice, Our Rights  
**Empowering citizens to understand their local MGNREGA performance — district by district.**

---

## 🌾 Overview

**Our Voice, Our Rights** brings government transparency closer to rural citizens by visualizing **MGNREGA** (Mahatma Gandhi National Rural Employment Guarantee Act) performance data in an easy-to-understand way.

Citizens can:
- 🗳️ Select their **district** to view live performance data  
- 📊 Compare key indicators like **workers employed, wages paid, and total expenditure**  
- 📈 See **past 12-month performance trends** through interactive charts  
- 📍 **Auto-detect their district** using location services  

> “Data that once lived in government APIs now lives in the hands of the people.”

---

## 🌍 Live Demo

🔗 **Website:** [https://our-voice-rights-1.onrender.com](https://our-voice-rights-1.onrender.com)

---

## 🧠 Problem Statement

The Government of India provides open APIs for programs like **MGNREGA**, but most citizens — especially in rural India — lack the technical ability to interpret this raw data.  
This project bridges that gap by converting complex government data into **simple, visual, and local-language insights**, accessible on any smartphone or computer.

---

## ⚙️ Features

✅ **District-level insights:** Select any Maharashtra district to see live MGNREGA data  
✅ **12-month history view:** Line & bar charts for trend analysis  
✅ **Auto district detection:** Uses GPS + OpenStreetMap reverse geocoding  
✅ **Accessible UI:** Simple Hindi labels and mobile-friendly layout  
✅ **Real API Integration:** Powered by official [data.gov.in](https://data.gov.in/) MGNREGA API  
✅ **Optimized for scale:** Express backend, PostgreSQL caching, and Render hosting  

---

## 🧩 Tech Stack

| **Layer** | **Technology Used** |
|------------|--------------------|
| **Frontend** | React (Vite), Recharts (Data Visualization) |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL (Render-hosted, SSL-enabled) |
| **API Source** | [data.gov.in](https://data.gov.in) |
| **Hosting** | Render (Full-stack Deployment) |
| **Geolocation** | OpenStreetMap Reverse Geocoding API |



---

## 🗺️ Architecture

```text
┌────────────────────┐
│   React Frontend   │
│ (Vite + Recharts)  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Express.js Backend │
│ (Node + API Layer) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  PostgreSQL Cache  │
│ (Render Cloud DB)  │
└────────┬───────────┘
         │
         ▼
┌──────────────────────────────┐
│ data.gov.in Public API (MGNREGA) │
└──────────────────────────────┘
```

## ⚙️ Environment Configuration

### 🧭 Local `.env` (Backend)

PGUSER=postgres  
PGHOST=localhost  
PGDATABASE=our_voice_right  
PGPASSWORD=your_local_password  
PGPORT=5432  
PORT=3000  
DATA_GOV_API_KEY=<your_data_gov_api_key>  
MGNREGA_RESOURCE_ID=<your_mgnrega_resource_id>  

---

### ☁️ Render (Backend → Environment Variables)

NODE_ENV=production  
DATABASE_URL=<your_render_postgres_connection_url>  
DATA_GOV_API_KEY=<your_data_gov_api_key>  
MGNREGA_RESOURCE_ID=<your_mgnrega_resource_id>  
PORT=10000  

💡 On Render, we use DATABASE_URL + SSL; locally, we use individual PG* variables.

---

### 🌐 Frontend (Render Static Site → Environment Variables)

VITE_API_BASE_URL=https://<your-backend-service>.onrender.com  

---

## 🖼️ Screenshots

Feature | Preview  
---------|---------  
🌍 Home Page | <img width="1891" height="761" alt="Screenshot 2025-10-28 212511" src="https://github.com/user-attachments/assets/a90fea5d-eb98-4d85-b9f3-d817711f902f" />
  
📈 Charts | <img width="887" height="965" alt="Screenshot 2025-10-28 212612" src="https://github.com/user-attachments/assets/881b7b7c-400a-49b6-8fcb-943eadd93593" />

 


---

## 📊 Data Accuracy Disclaimer

This platform displays information from the official data.gov.in MGNREGA API.  
While every effort is made to show accurate and up-to-date data, there may be:

- ⏳ Temporary delays in government data updates  
- ❌ Missing values for certain districts or months  
- 💰 Rounding differences in expenditure or person-days  

For official verification of data, please refer to the Ministry of Rural Development website.

---

## 💡 Future Enhancements

🕒 Automated daily sync of API data to PostgreSQL (offline-ready cache)  
🌐 Expand coverage to all Indian states  
🔊 Add multilingual voice assistance for accessibility  

---

## 👨‍💻 Developer

**Mayank Rose Xalxo**  
📍 Sohagpur, India  
💻 MCA Student | Full-Stack Developer | IoT & Web Enthusiast  
✉️ mayankxrose@gmail.com  

---

## 🏁 License

MIT License  

---

## 🌟 Acknowledgements

🇮🇳 Government of India — Open public datasets via [data.gov.in](https://data.gov.in)  
🗺️ OpenStreetMap — Reverse geocoding APIs  
☁️ Render — Free-tier cloud hosting for open projects  
