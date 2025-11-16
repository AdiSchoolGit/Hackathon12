# Setup Guide - API Integrations

This guide will help you set up Google Vision API and SendGrid for Clumsy Aztecs.

## 1. Google Vision API Setup (for OCR)

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Vision API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

### Step 2: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Click "Create and Continue"
5. Grant the "Cloud Vision API User" role
6. Click "Done"

### Step 3: Download Service Account Key
1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the key file
6. **Save it securely** - this file contains sensitive credentials

### Step 4: Configure Backend
1. Place the JSON key file in your `backend/` directory (or anywhere secure)
2. Add to your `backend/.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-service-account-key.json
   ```
   Example:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json
   ```

### Step 5: Install Dependencies
```bash
cd backend
npm install
```

## 2. SendGrid Setup (for Email Notifications)

### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (allows 100 emails/day)

### Step 2: Create API Key
1. Log in to SendGrid
2. Go to "Settings" > "API Keys"
3. Click "Create API Key"
4. Name it (e.g., "Clumsy Aztecs")
5. Choose "Full Access" or "Restricted Access" (with Mail Send permissions)
6. Click "Create & View"
7. **Copy the API key immediately** - you won't be able to see it again!

### Step 3: Verify Sender Email (Required for Production)
1. Go to "Settings" > "Sender Authentication"
2. Either:
   - **Single Sender Verification**: Verify a single email address
   - **Domain Authentication**: Verify your entire domain (recommended for production)

### Step 4: Configure Backend
Add to your `backend/.env` file:
```
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@lostid.sdsu.edu
```

**Note**: For testing, you can use any verified email address. For production, use an SDSU email or verified domain.

## 3. Environment Variables Summary

Your `backend/.env` file should look like this:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Vision API
GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json

# SendGrid
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@lostid.sdsu.edu
```

## 4. Testing the Setup

### Test OCR (without full setup)
The system will work without Google Vision, but OCR won't extract text. You'll see warnings in the console.

### Test Email (without full setup)
The system will work without SendGrid, but emails won't be sent. You'll see the email content logged to the console.

### Full Test
1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:5173/found`
4. Take a photo or upload an image of an SDSU ID card
5. Submit the form
6. Check the backend console for OCR results
7. Check the email inbox (if SendGrid is configured)

## 5. Troubleshooting

### Google Vision API Issues
- **Error: "Could not load the default credentials"**
  - Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to the correct file path
  - Make sure the JSON file is valid
  - Make sure Cloud Vision API is enabled in your project

### SendGrid Issues
- **Error: "Unauthorized"**
  - Check that your API key is correct
  - Make sure the API key has "Mail Send" permissions

- **Error: "The from address does not match a verified Sender Identity"**
  - Verify your sender email in SendGrid dashboard
  - Use a verified email address in `SENDGRID_FROM_EMAIL`

### General Issues
- Make sure all dependencies are installed: `npm install` in both `backend/` and `frontend/`
- Check that both servers are running
- Check browser console and backend console for error messages

## 6. Security Notes

⚠️ **Important Security Practices:**
- Never commit `.env` files or API keys to git
- Never commit service account JSON files to git
- Add `.env` and `*.json` (key files) to `.gitignore`
- Use environment variables in production (not `.env` files)
- Rotate API keys regularly
- Use restricted API key permissions when possible

## 7. Production Deployment

For production:
1. Use environment variables instead of `.env` files
2. Store credentials in a secure secrets manager (AWS Secrets Manager, Google Secret Manager, etc.)
3. Use domain authentication in SendGrid
4. Set up proper error monitoring
5. Use HTTPS for all API calls
6. Implement rate limiting

