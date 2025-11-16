# Clumsy Aztecs

A centralized system for managing lost and found student ID cards. The app connects finders, card owners, and Arduino-based pickup boxes through a clean React frontend and Node.js backend.

## Architecture

```
lostid-project/
  backend/          # Node.js + Express API
  frontend/         # React + Vite web app
```

The backend exposes REST APIs that can be used by:
- The React web app
- Future mobile apps
- Arduino boxes (via HTTP requests)

## Features

### For Finders
- **Take a photo directly** using your device camera or upload an image
- Automatically extracts student information using Google Vision OCR
- Optionally provide location and contact information
- System automatically finds the owner and sends them an email
- Receive a reference ID for tracking

### For Card Owners
- Check card status by entering their card ID
- View pickup instructions (box location and code)
- See contact information if someone found their card

### For Arduino Boxes
- Report scanned cards via API
- Validate pickup codes
- Receive unlock commands from the backend

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example file: `cp backend/.env.example backend/.env`
   - Edit `backend/.env` and fill in your actual API keys and configuration
   
   The `.env.example` file shows all required environment variables:
   - `PORT` - Server port (default: 4000)
   - `NODE_ENV` - Environment (development/production)
   - `FRONTEND_URL` - Frontend URL for CORS
   - `SENDGRID_API_KEY` - SendGrid API key for email notifications
   - `SENDGRID_FROM_EMAIL` - Verified sender email address
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account JSON file

**See [SETUP.md](./SETUP.md) for detailed API setup instructions.**

4. **Set up MySDSU login (one-time setup):**
   
   The system automatically looks up student emails from MySDSU. You need to login once to save your session cookies:
   
   ```bash
   cd backend
   node src/scripts/login-mysdsu.js
   ```
   
   This will:
   - Open a browser window
   - Let you login to MySDSU (including Duo 2FA)
   - Save your session cookies for automatic lookups
   - You won't need to login again until cookies expire
   
   **When to re-run the login script:**
   - When you first set up the system
   - When you see errors about "cookies expired" or "invalid cookies"
   - If automatic lookups stop working

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### POST `/api/found-card-photo`
Used by the web app when someone uploads a photo.

**Request:** `multipart/form-data`
- `cardImage` (file): Photo of the student ID card
- `finderContact` (optional): Contact information
- `locationDescription` (optional): Where the card was found

**Response:**
```json
{
  "cardId": "uuid",
  "message": "Thanks, we are trying to contact the owner..."
}
```

### POST `/api/found-card-redid`
Used by Arduino boxes when a card is scanned.

**Request:**
```json
{
  "redId": "123456789",
  "boxId": "BOX_1"
}
```

**Response:**
```json
{
  "cardId": "uuid",
  "pickupCode": "384729"
}
```

### POST `/api/pickup-request`
Used by boxes and apps to validate pickup codes.

**Request:**
```json
{
  "pickupCode": "123456",
  "boxId": "BOX_1"
}
```

**Response:**
```json
{
  "ok": true
}
```
or
```json
{
  "ok": false,
  "reason": "invalid_code"
}
```

### GET `/api/cards/:id`
Get card details by ID.

**Response:**
```json
{
  "id": "uuid",
  "redId": "123456789",
  "status": "notified_owner",
  "boxId": "BOX_1",
  "pickupCode": "384729",
  ...
}
```

### GET `/api/cards`
Get all cards (for debugging/admin).

## Current Implementation Status

### ✅ Fully Implemented
- Backend API with in-memory storage
- React frontend with two main pages
- **Camera capture** - Take photos directly in the app
- **Image upload** handling
- **Google Vision OCR** - Automatically extracts RedID and name from card images
- **SDSU Email Lookup** - Finds student email using RedID@sdsu.edu format
- **Automatic Email Notifications** - Sends emails via SendGrid when card is found
- Card status tracking
- Pickup code generation and validation
- **Automatic Processing** - OCR → Find Owner → Send Email workflow

### 🔄 Optional Enhancements
- **Directory Service** - Can be enhanced with actual SDSU directory API
  - Currently uses standard SDSU email format (RedID@sdsu.edu)
  - Ready for database or API integration

- **Database** - Currently uses in-memory storage
  - Ready for Prisma + PostgreSQL or Supabase integration

### 📝 Next Steps (Optional Enhancements)

1. **Replace in-memory store with database**
   - Option: Prisma + PostgreSQL
   - Option: Supabase

2. **Enhanced directory lookup**
   - Connect to actual SDSU directory API
   - Add name-based lookup with database

3. **Add authentication**
   - Protect admin endpoints
   - Add user login for card owners

4. **Build admin dashboard**
   - View all cards and their status
   - Manual card management

5. **Mobile app**
   - React Native app using the same backend APIs

## Testing the System

### Test Found Card Flow (Web App)
1. Open `http://localhost:5173/found`
2. Upload a test image
3. Fill in optional fields
4. Submit and note the card ID

### Test Status Check
1. Open `http://localhost:5173/status`
2. Enter the card ID from step above
3. View the card status

### Test Arduino Box Flow (via curl or Postman)

**Report a found card:**
```bash
curl -X POST http://localhost:4000/api/found-card-redid \
  -H "Content-Type: application/json" \
  -d '{"redId": "123456789", "boxId": "BOX_1"}'
```

**Validate pickup code:**
```bash
curl -X POST http://localhost:4000/api/pickup-request \
  -H "Content-Type: application/json" \
  -d '{"pickupCode": "384729", "boxId": "BOX_1"}'
```

## Project Structure

```
backend/
  src/
    routes/
      cards.js          # API route handlers
    services/
      ocrService.js     # OCR integration (stubbed)
      directoryService.js  # User lookup (stubbed)
      notificationService.js  # Email sending (stubbed)
    store/
      cardsStore.js     # In-memory data store
    server.js           # Express server setup
  package.json
  .env                 # Environment variables

frontend/
  src/
    components/
      Navbar.jsx       # Navigation component
    pages/
      FoundCardPage.jsx      # "I found a card" page
      LostCardStatusPage.jsx # "Check status" page
    App.jsx            # Main app component
    main.jsx           # Entry point
  package.json
  vite.config.js
```

## Notes

- The backend uses in-memory storage. Data will be lost on server restart.
- **Google Vision API** is integrated - set up credentials to enable OCR (see SETUP.md)
- **SendGrid** is integrated - set up API key to enable email notifications (see SETUP.md)
- The system works without API keys but will log warnings and won't send emails
- CORS is configured to allow the frontend origin during development.
- Image uploads are saved to `backend/uploads/` directory.
- **Automatic workflow**: Photo → OCR → Find Owner → Send Email (all automatic!)

