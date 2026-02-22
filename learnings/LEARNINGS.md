# Mantaga Learnings

## Purpose
Document errors, fixes, and lessons learned to avoid repeating mistakes.

---

## 2026-02-22

### Error 1: MiniMax API Endpoint Wrong
**Issue:** PDF parsing via MiniMax failed with "Failed to parse with AI"

**Root Cause:** Used wrong API endpoint (`https://api.minimax.chat/v1/text/_v2`)

**Fix:** Changed to correct endpoint (`https://api.minimax.io/v1/chat/completions`)

**Also Fixed:**
- Changed header from `chatcompletionAuthorization` to `Authorization`
- Changed model reference format

**File:** `src/app/api/atlas-parse/route.ts`

---

### Error 2: Middleware Blocking API Routes
**Issue:** Atlas API route was blocked by authentication middleware

**Fix:** Added `/api/atlas-parse` to allowed routes in middleware

**File:** `src/middleware.ts`

---

### Error 3: PDF File Type Not Showing in File Picker
**Issue:** Couldn't select PDF files when uploading LPO

**Fix:** Added MIME types to accept attribute in file input

**File:** `src/app/upload/page.tsx`

---

### Error 4: NextAuth Session Not Updating on Login
**Issue:** After login, had to refresh page to see user

**Fix:** Added `window.location.href = "/"` for immediate redirect

**File:** `src/app/auth/signin/page.tsx`

---

### Error 5: Build Errors with Convex Types
**Issue:** Convex mutations not properly typed in API routes

**Fix:** Cast to `any` to bypass TypeScript strictness
```typescript
await (convex.mutation as any)("createUser", {...})
```

---

### Error 6: PDF Parsing Libraries Not Working
**Issue:** pdfjs-dist and pdf-parse had Node.js compatibility issues with Vercel

**Solution:** Use MiniMax AI to parse PDFs instead of libraries

---

## Lessons Learned

1. **Use AI for document parsing** - Libraries are complex, AI is simpler
2. **Always check API endpoints** - Each provider has different URLs
3. **Document middleware changes** - Easy to forget which routes are public
4. **Test file inputs** - Accept attributes need both extensions AND MIME types

---

*Last Updated: 2026-02-22*
