const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");

dotenv.config();
const app = express();

// Security Middleware
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(helmet());

const EMAIL = "aditi.batra@chitkara.edu.in"; // Change if needed

/* ===========================
   HEALTH ROUTE
=========================== */
app.get("/health", (req, res) => {
    return res.status(200).json({
        is_success: true,
        official_email: EMAIL
    });
});

/* ===========================
   UTILITY FUNCTIONS
=========================== */

function fibonacci(n) {
    if (n === 0) return [];
    if (n === 1) return [0];
    let series = [0, 1];
    for (let i = 2; i < n; i++) {
        series.push(series[i - 1] + series[i - 2]);
    }
    return series;
}

function isPrime(num) {
    if (!Number.isInteger(num) || num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return Math.abs(a);
}

function lcmArray(arr) {
    return arr.reduce((a, b) => Math.abs(a * b) / gcd(a, b));
}

function hcfArray(arr) {
    return arr.reduce((a, b) => gcd(a, b));
}

/* ===========================
   MAIN ROUTE
=========================== */
app.post("/bfhl", async (req, res) => {
    try {

        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                is_success: false,
                error: "Invalid request body"
            });
        }

        const keys = Object.keys(req.body);

        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                error: "Exactly one key must be provided"
            });
        }

        const key = keys[0];
        let result;

        // Fibonacci
        if (key === "fibonacci") {
            const n = req.body.fibonacci;

            if (!Number.isInteger(n) || n < 0 || n > 1000) {
                return res.status(400).json({
                    is_success: false,
                    error: "Invalid fibonacci input"
                });
            }

            result = fibonacci(n);
        }

        // Prime
        else if (key === "prime") {
            const arr = req.body.prime;

            if (!Array.isArray(arr) || arr.length === 0 || arr.length > 1000) {
                return res.status(400).json({
                    is_success: false,
                    error: "Invalid prime input"
                });
            }

            if (!arr.every(Number.isInteger)) {
                return res.status(400).json({
                    is_success: false,
                    error: "All elements must be integers"
                });
            }

            result = arr.filter(isPrime);
        }

        // LCM
        else if (key === "lcm") {
            const arr = req.body.lcm;

            if (!Array.isArray(arr) || arr.length < 2) {
                return res.status(400).json({
                    is_success: false,
                    error: "Invalid lcm input"
                });
            }

            if (!arr.every(Number.isInteger)) {
                return res.status(400).json({
                    is_success: false,
                    error: "All elements must be integers"
                });
            }

            result = lcmArray(arr);
        }

        // HCF
        else if (key === "hcf") {
            const arr = req.body.hcf;

            if (!Array.isArray(arr) || arr.length < 2) {
                return res.status(400).json({
                    is_success: false,
                    error: "Invalid hcf input"
                });
            }

            if (!arr.every(Number.isInteger)) {
                return res.status(400).json({
                    is_success: false,
                    error: "All elements must be integers"
                });
            }

            result = hcfArray(arr);
        }

        // AI
        else if (key === "AI") {
            const question = req.body.AI;

            if (typeof question !== "string" || question.trim() === "") {
                return res.status(400).json({
                    is_success: false,
                    error: "Invalid AI question"
                });
            }

            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({
                    is_success: false,
                    error: "AI API key not configured"
                });
            }

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [
                        {
                            parts: [{ text: question }]
                        }
                    ]
                }
            );

            const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                return res.status(500).json({
                    is_success: false,
                    error: "AI response error"
                });
            }

            result = text.trim().split(/\s+/)[0];
        }

        else {
            return res.status(400).json({
                is_success: false,
                error: "Invalid key provided"
            });
        }

        return res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            is_success: false,
            error: "Internal server error"
        });
    }
});

/* ===========================
   SERVER START
=========================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
