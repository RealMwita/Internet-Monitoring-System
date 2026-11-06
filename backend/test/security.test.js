import test from 'node:test';
import assert from 'node:assert/strict';
import {
    securityHeaders,
    uploadStaticHeaders,
    createRateLimiter,
    isSafeBrandingImageUrl
} from '../src/middlewares/security.middleware.js';
import { assertConfiguredRouter } from '../services/mikrotik.service.js';

test('securityHeaders attaches defensive HTTP headers', () => {
    const headers = {};
    let nextCalled = false;
    securityHeaders(
        {},
        { setHeader: (k, v) => { headers[k] = v; } },
        () => { nextCalled = true; }
    );
    assert.equal(nextCalled, true);
    assert.equal(headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(headers['X-Frame-Options'], 'DENY');
    assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
});

test('uploadStaticHeaders blocks script execution on uploaded files', () => {
    const headers = {};
    uploadStaticHeaders({ setHeader: (k, v) => { headers[k] = v; } });
    assert.equal(headers['X-Content-Type-Options'], 'nosniff');
    assert.match(headers['Content-Security-Policy'], /script-src 'none'/);
});

test('createRateLimiter blocks requests exceeding window quota', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Rate limited' });
    const req = { ip: '192.0.2.10' };
    const makeRes = () => ({
        headers: {},
        statusCode: 200,
        body: null,
        setHeader(k, v) { this.headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; }
    });

    let passed = 0;
    limiter(req, makeRes(), () => { passed++; });
    limiter(req, makeRes(), () => { passed++; });
    const blockedRes = makeRes();
    limiter(req, blockedRes, () => { passed++; });

    assert.equal(passed, 2);
    assert.equal(blockedRes.statusCode, 429);
    assert.equal(blockedRes.body.success, false);
    assert.ok(Number(blockedRes.headers['Retry-After']) >= 1);
});

test('isSafeBrandingImageUrl rejects XSS schemes, traversal, and cross-tenant paths', () => {
    assert.equal(isSafeBrandingImageUrl('/uploads/companies/1/logo-abc.png', 1), true);
    assert.equal(isSafeBrandingImageUrl('https://cdn.example.com/logo.png', 1), true);
    assert.equal(isSafeBrandingImageUrl(null, 1), true);
    assert.equal(isSafeBrandingImageUrl('javascript:alert(1)', 1), false);
    assert.equal(isSafeBrandingImageUrl('data:text/html,<script>alert(1)</script>', 1), false);
    assert.equal(isSafeBrandingImageUrl('/uploads/companies/2/logo-abc.png', 1), false);
    assert.equal(isSafeBrandingImageUrl('/uploads/companies/1/../2/logo.png', 1), false);
});

test('assertConfiguredRouter rejects malformed or SSRF-like host strings', () => {
    assert.doesNotThrow(() => assertConfiguredRouter({ host: '10.50.0.2', status: 'active' }));
    assert.throws(() => assertConfiguredRouter({ host: '10.50.0.2/admin', status: 'active' }));
    assert.throws(() => assertConfiguredRouter({ host: 'user:pass@10.50.0.2', status: 'active' }));
});

