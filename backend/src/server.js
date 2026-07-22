// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Supabase client (requires SERVICE_ROLE key)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_SERVICE_KEY not set in env.");
}
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

// --- Debug keys so you can confirm in logs (remove in production)
console.log("RAZORPAY_KEY_ID:", !!process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", !!process.env.RAZORPAY_KEY_SECRET);
console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
console.log("PORT:", PORT);

// --- CORS
// Allowed origins: add your live frontend + local dev origin here
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://online-learn-ing.netlify.app",
  // If you have render backend public url, don't need to include it here for server->server,
  // but it doesn't hurt if you call APIs from other domains:
  "https://online-learning-backend-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://on-line-learn-ing.netlify.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);


// IMPORTANT: do NOT add app.options('*' or '/*') — that breaks path-to-regexp on Express version used by Render

app.use(express.json());

// --- Razorpay instance
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay keys are missing from env. Payments will fail until set.");
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// --- Health check
app.get("/", (req, res) => {
  res.send({
    ok: true,
    message: "Backend running",
    env: process.env.NODE_ENV || "development",
  });
});

// --- Create Order
app.post("/payment/create-order", async (req, res) => {
  try {
    const { amount, courseId, studentId } = req.body;
    if (!amount || !courseId || !studentId) {
      return res.status(400).json({
        success: false,
        error: "Missing: amount, courseId or studentId",
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { courseId, studentId },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return res.status(500).json({
      success: false,
      error: "Order creation failed",
      details: err?.message,
    });
  }
});

// --- Verify Payment and save purchase
app.post("/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      courseId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !studentId ||
      !courseId
    ) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Invalid signature:", { generatedSignature, razorpay_signature });
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // Insert into Supabase purchases table (unique constraint prevents dupes)
    const { error } = await supabase.from("course_purchases").insert({
      student_id: studentId,
      course_id: courseId,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      // If duplicate key error you may still want to return success (already purchased)
      return res.status(500).json({ success: false, error: "Database insert failed", details: error });
    }

    return res.json({ success: true, message: "Payment Verified & Purchase Saved" });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ success: false, error: "Verification failed", details: err?.message });
  }
});

// --- Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
