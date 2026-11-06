// Import Express
import express from "express";

// Import public payment controllers
import {
    initiatePayment,
    createCashPaymentRequest,
    getPaymentStatus
} from "../../controllers/public/payment.controller.js";
import { paymentRateLimiter } from "../../middlewares/security.middleware.js";


// Create public payment router
const router = express.Router();


// Initiate mobile payment for one company
router.post(
    "/companies/:companySlug/payments/initiate",
    paymentRateLimiter,
    initiatePayment
);


// Create cash payment request for one company
router.post(
    "/companies/:companySlug/payments/cash-request",
    paymentRateLimiter,
    createCashPaymentRequest
);


// Check payment status inside one company
router.get(
    "/companies/:companySlug/payments/:reference/status",
    getPaymentStatus
);


// Export router
export default router;
