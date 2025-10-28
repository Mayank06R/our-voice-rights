🗳️ Our Voice, Our Rights

Empowering citizens to understand their local MGNREGA performance — district by district.

🌾 Overview

The Our Voice, Our Rights platform brings government transparency closer to rural citizens by visualizing MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) performance data in an easy-to-understand way.

Citizens can:

Select their district to view live performance data.

Compare key indicators like workers employed, wages paid, and total expenditure.

See past 12-month performance trends through interactive charts.

Optionally auto-detect their district using location services.

“Data that once lived in government APIs now lives in the hands of the people.”

🌍 Live Demo

🔗 Website: https://our-voice-rights-1.onrender.com

🧠 Problem Statement

The Government of India provides open APIs for programs like MGNREGA, but most citizens — especially in rural India — lack the technical ability to interpret this raw data.
This project bridges that gap by converting complex data into simple, visual insights accessible via any smartphone or computer.

⚙️ Features

✅ District-level insights: Select any district in Maharashtra to see live MGNREGA data.
✅ 12-month history view: Line and bar charts for easy trend comparison.
✅ Auto district detection: Uses GPS and OpenStreetMap to identify the user’s district automatically.
✅ Accessible UI: Designed with simple Hindi labels and clean visuals for low-literacy audiences.
✅ Real API Integration: Powered by the official data.gov.in MGNREGA API
.
✅ Optimized for scale: Uses PostgreSQL caching and Render deployment to handle large-scale traffic.

🧩 Tech Stack
Layer	Technology Used
Frontend	React.js (Vite), Recharts (for data visualization)
Backend	Node.js, Express.js
Database	PostgreSQL (Render-hosted, SSL-enabled)
API Source	data.gov.in

Hosting	Render (Full-stack deployment)
Geolocation	OpenStreetMap Reverse Geocoding API
🗺️ Architecture
React (Frontend)
   ↓
Express API (Backend)
   ↓
PostgreSQL (Cache + Analytics)
   ↓
Data.gov.in (Live MGNREGA Data Source)

⚙️ Environment Configuration
🧭 .env (local setup)
PGUSER=postgres
PGHOST=localhost
PGDATABASE=our_voice_right
PGPASSWORD=your_local_password
PGPORT=5432
PORT=3000
DATA_GOV_API_KEY=579b464db66ec23bdd000001243973cbd50e42f65f3b0e9ba2658691
MGNREGA_RESOURCE_ID=ee03643a-ee4c-48c2-ac30-9f2ff26abpupg-a4e3-4177-8586-2bcc27b74552

☁️ Render Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://our_voice_db_user:fY7ZqHdROzExfb0n86CrC652eqshyKW7@dpg-d40bt3v5r7bs73abpupg-a.singapore-postgres.render.com/our_voice_db
DATA_GOV_API_KEY=579b464db66ec23bdd000001243973cbd50e42f65f3b0e9ba2658691
MGNREGA_RESOURCE_ID=ee03643a-ee4c-48c2-ac30-9f2ff26ab722

🖼️ Screenshots
Feature	Preview
🌍 Home Page	

📈 Chart Visualization	

📍 Auto-detect Feature	

(Replace the placeholders with real screenshots before submission.)

📊 Data Accuracy Disclaimer

This platform displays information from the official data.gov.in MGNREGA API.
While every effort is made to show accurate and up-to-date data, there may be:

Temporary delays in government data updates.

Missing values for certain districts or months.

Rounding errors in figures like expenditure or person-days.

Users are advised to refer to the Ministry of Rural Development portal for official verification of data.

💡 Future Enhancements

🕒 Automated daily sync of API data to PostgreSQL for offline use.

🌐 Expand to all Indian states (not just Maharashtra).

🔊 Add multilingual voice assistance for accessibility.

👨‍💻 Developer

Mayank Rose Xalxo
📍 Vadodara, India
💻 MCA Student | Full-Stack Developer | IoT & Web Enthusiast
✉️ mayankrose@gmail.com

🏁 License

This project is open-source under the MIT License.

🌟 Acknowledgements

Special thanks to:

Government of India for providing open public datasets via data.gov.in

OpenStreetMap for free and accessible geolocation APIs

Render for supporting free-tier cloud deployment for open projects