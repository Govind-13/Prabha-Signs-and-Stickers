# Prabha Signs and Stickers – Deployment Notes

## Conversation Log (Saved for Reference)

The following is a summary of the recent troubleshooting conversation that helped resolve deployment issues on Render and Vercel. It is captured here for future reference.

---

### Issue Encountered
- **Render Port‑scan timeout**: "Port scan timeout reached, failed to detect open port 5000 from PORT environment variable. Bind your service to port 5000 or update the PORT environment variable to the correct port."

### Root Cause
- The backend `.env` file forced `PORT=5000`, overriding Render’s dynamically assigned port.
- Dockerfile exposed only `EXPOSE 5000`, limiting Render’s health‑check.

### Fix Implemented
1. **Removed static `PORT` variable** from `backend/.env`.
2. **Updated Dockerfile**:
   ```Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY . .

   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app .
   ENV NODE_ENV=production
   EXPOSE 0-65535   # allow any Render‑assigned port
   CMD ["node", "server.js"]
   ```
3. **Committed & pushed** the changes to GitHub.
4. **Redeployed** the service on Render – health‑check now passes.
5. **Configured Vercel** environment variable `VITE_API_URL` to point to the new Render backend URL.

### Verification Steps
- After redeploy, Render logs show `Server running on port <dynamic_port>`.
- Vercel preview works; API calls succeed (checked via Network tab).

---

### Additional Notes
- The backend `server.js` already falls back to port `5000` if `process.env.PORT` is not set, which is safe for local development.
- Vercel environment variables require the `VITE_` prefix to be exposed to the client bundle.
- Remember to keep the `.env` file out of version control (added to `.gitignore`).

---

*This README entry was automatically added on 2026‑05‑23 to preserve the troubleshooting workflow.*
