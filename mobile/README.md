# Clumsy Aztecs - React Native Mobile App

React Native mobile application for the Clumsy Aztecs lost ID card system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

3. Start the development server:
```bash
npm start
```

## Running on Device

### iOS
- Install Expo Go app from App Store
- Scan QR code from terminal
- Or run: `npm run ios`

### Android
- Install Expo Go app from Play Store
- Scan QR code from terminal
- Or run: `npm run android`

## Important Notes

### Backend Connection
- The app connects to `http://localhost:4000` by default
- For physical devices, you need to change the `API_URL` in each page component to your computer's IP address
- Example: `const API_URL = 'http://192.168.1.100:4000';`

### Camera Permissions
- The app requires camera permissions to take photos
- These are automatically requested when you try to take a photo

## Project Structure

```
mobile/
├── App.js                 # Main app with navigation
├── src/
│   └── pages/
│       ├── FoundCardPage.js      # Report found card
│       ├── LostCardStatusPage.js # Check card status
│       └── AdminPage.js          # Admin panel
└── package.json
```

## Features

- 📷 Take photos of found ID cards
- 📁 Upload photos from gallery
- 🔍 Check card status by ID
- 👨‍💼 Admin panel for staff
- 📧 Send email notifications

