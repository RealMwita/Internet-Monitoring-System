// Security headers, CORS policy, rate limiting, and URL validation helpers

// Standard HTTP security headers for API responses
export const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
};

// Prevent browsers from executing active content from uploaded static files
export const uploadStaticHeaders = (res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; img-src 'self'; style-src 'none'; script-src 'none'"
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
};

// Build CORS configuration respecting ALLOWED_ORIGINS when configured
export const buildCorsOptions = () => {
    const allowedList = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return {
        origin: (origin, callback) => {
            if (!origin || allowedList.length === 0 || allowedList.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Origin not allowed by CORS"));
        },
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 600
    };
};

// Lightweight in-memory rate limiter for auth and public endpoints
export const createRateLimiter = ({
    windowMs = 60_000,
    max = 60,
    message = "Too many requests. Please try again later.",
    keyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown"
} = {}) => {
    const buckets = new Map();

    const cleanup = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of buckets.entries()) {
            if (entry.resetAt <= now) {
                buckets.delete(key);
            }
        }
    }, Math.max(windowMs, 60_000));

    cleanup.unref?.();

    return (req, res, next) => {
        const now = Date.now();
        const key = String(keyGenerator(req) || "unknown");
        let entry = buckets.get(key);

        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            buckets.set(key, entry);
        }

        entry.count += 1;
        const remaining = Math.max(0, max - entry.count);
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(remaining));

        if (entry.count > max) {
            const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
            return res.status(429).json({
                success: false,
                message
            });
        }

        return next();
    };
};

// Brute-force protection for administrator login
export const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60_000,
    max: 10,
    message: "Too many login attempts. Please try again in 15 minutes.",
    keyGenerator: (req) => {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        return `login:${ip}:${email}`;
    }
});

// Rate limit payment initiation to prevent USSD push-bombing and cash-queue spam
export const paymentRateLimiter = createRateLimiter({
    windowMs: 5 * 60_000,
    max: 10,
    message: "Too many payment requests. Please wait a few minutes before trying again.",
    keyGenerator: (req) => {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const mac = typeof req.body?.mac === "string" ? req.body.mac.trim().toUpperCase() : "";
        return `payment:${ip}:${mac}`;
    }
});

// Rate limit router reconnect checks
export const reconnectRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 20,
    message: "Too many reconnect attempts. Please wait a moment and try again."
});

// General rate limit for public endpoints
export const publicApiRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 120,
    message: "Too many requests. Please slow down and try again."
});

// Validate branding/logo image URLs to block javascript:/data: XSS and cross-tenant paths
export const isSafeBrandingImageUrl = (value, companyId = null) => {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value !== "string" || value.length > 500) {
        return false;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return true;
    }
    if (trimmed.startsWith("/uploads/")) {
        if (trimmed.includes("..") || trimmed.includes("\\")) {
            return false;
        }
        if (companyId !== null) {
            return new RegExp(`^/uploads/companies/${Number(companyId)}/[a-zA-Z0-9_-]+\\.(jpg|png|webp)$`).test(trimmed);
        }
        return /^\/uploads\/companies\/\d+\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(trimmed);
    }
    try {
        const parsed = new URL(trimmed);
        return (parsed.protocol === "https:" || parsed.protocol === "http:") && !parsed.username && !parsed.password;
    } catch {
        return false;
    }
};

