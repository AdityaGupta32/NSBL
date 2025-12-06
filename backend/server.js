const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const connectDB = require("./config/db");

// Config
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Allows frontend to connect

// Import Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/inquiries", require("./routes/inquiryRoute"));
app.use("/api/products", require("./routes/productRoute"));

// =========================================================
//  REAL-TIME RATE ENGINE
// =========================================================

// ✅ FIXED: Now it reads from your .env file
// If .env says TEST_MODE=true, it uses Mock Data.
// If .env says TEST_MODE=false, it uses Real GoldAPI.
const TEST_MODE = process.env.TEST_MODE === 'true'; 

const API_KEY = process.env.GOLD_API_KEY;
const CACHE_DURATION = 30 * 1000; // Update every 30 seconds

let cachedData = null;
let lastFetchTime = 0;

// Helper: Generates random realistic fluctuations for testing
function getMockRates() {
    const baseGold = 75000;
    const baseSilver = 89000;
    const baseUsd = 83.50;
    
    const fluctuation = (Math.random() - 0.5) * 400; 

    return {
        gold: Math.floor(baseGold + fluctuation),
        silver: Math.floor(baseSilver + (fluctuation * 1.5)),
        usd: +(baseUsd + (Math.random() - 0.5)).toFixed(2)
    };
}

async function getRealRates() {
    const now = Date.now();
    
    // 1. Check Cache (Don't call API if data is fresh)
    if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedData;
    }

    // 2. Test Mode (From .env)
    if (TEST_MODE) {
        console.log("🔄 [TEST MODE] Generating mock rates...");
        cachedData = getMockRates();
        lastFetchTime = now;
        return cachedData;
    }

    // 3. Live Mode (GoldAPI)
    try {
        console.log("🌍 [LIVE] Fetching real rates from GoldAPI...");
        
        const config = {
            headers: { 
                "x-access-token": API_KEY,
                "Content-Type": "application/json"
            }
        };

        const [goldRes, silverRes] = await Promise.all([
            axios.get("https://www.goldapi.io/api/XAU/INR", config),
            axios.get("https://www.goldapi.io/api/XAG/INR", config)
        ]);

        const goldSpot = goldRes.data.price; 
        const silverSpot = silverRes.data.price;

        // Convert International Ounce Price to Indian Retail Price
        cachedData = {
            gold: Math.floor((goldSpot / 31.1035) * 10 * 1.15),
            silver: Math.floor((silverSpot / 31.1035) * 1000 * 1.15),
            usd: 83.50 
        };

        lastFetchTime = now;
        console.log("✅ Rates Updated:", cachedData);
        
    } catch (error) {
        console.error("❌ API Failed:", error.message);
        if (!cachedData) cachedData = getMockRates(); // Fallback so site doesn't crash
    }

    return cachedData;
}

// RATE ENDPOINT
app.get("/api/rates", async (req, res) => {
    const data = await getRealRates();

    res.json({
        gold_999: data.gold + 150, 
        gold_995: data.gold,       
        silver: data.silver,
        usd: data.usd,
        last_updated: new Date().toLocaleTimeString(),
        is_live: !TEST_MODE 
    });
});

// Root Route
app.get("/", (req, res) => {
  res.send("NSBL Backend is Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🚀 Mode: ${TEST_MODE ? 'TESTING (Mock Data)' : 'PRODUCTION (Real API)'}`);
});