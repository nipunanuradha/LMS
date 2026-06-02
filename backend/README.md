---
title: LMS Backend
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# LMS Backend Space

This directory contains the backend for the LMS system, configured for hosting on Hugging Face Spaces using the Docker SDK.

## Hugging Face Spaces Setup

1. Create a new Space on Hugging Face.
2. Select **Docker** as the SDK.
3. Choose the **Blank** template (it will automatically read the `Dockerfile`).
4. In your Space's Settings page, add your **Repository Secrets** (Environment Variables):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `JWT_SECRET`
   - `BACKEND_URL` (The public URL of your Space, e.g. `https://<your-username>-<space-name>.hf.space`)
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `PLATFORM_NAME`
   - `RESEND_API_KEY` (Optional: Set this API key from resend.com to use Resend's REST API for email replies instead of SMTP)
   - `RESEND_FROM_EMAIL` (Optional: The sender email verified in resend.com, e.g. `onboarding@resend.dev` or your custom domain email)
