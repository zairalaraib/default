# Laundry App

A React Native app built with Expo and Supabase for managing laundry pickups. The app has two user roles:

1. **User Interface**: Regular users can log in and approve their availability for laundry pickup. Availability resets daily.
2. **Laundry Guy Interface**: Laundry service personnel can log in and see a list of all buildings and flat numbers where pickups need to be made.

## Features

- User authentication with Supabase
- Role-based interfaces (User vs Laundry Guy)
- Daily availability management
- Real-time collection list for laundry personnel
- Auto-reset of availability each day

## Prerequisites

- Node.js installed
- Expo Go app on your mobile device (iOS or Android)
- Supabase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL from `supabase-schema.sql` to create the necessary tables and functions
4. Go to Project Settings > API to get your credentials

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Run the App

Start the development server:

```bash
npx expo start
```

Then:
- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator (macOS only)
- Or press `w` for web browser

## Usage

### For Users

1. Sign up with:
   - Email and password
   - Select "User" role
   - Provide your building and flat number
2. Log in to your account
3. Mark yourself as available/unavailable for laundry pickup each day
4. Your availability resets automatically at midnight

### For Laundry Personnel

1. Sign up with:
   - Email and password
   - Select "Laundry Guy" role
2. Log in to your account
3. View the list of all available pickups for today
4. See building and flat numbers for each pickup
5. Pull down to refresh the list

## Database Schema

### Tables

- **profiles**: Extended user information (role, building, flat_no)
- **availability**: Daily availability status for users

### Functions

- `get_todays_collections()`: Returns all users with their availability status for today

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **Navigation**: React Navigation
- **State Management**: React Context API

## Project Structure

```
.
├── App.js                      # Main app component with navigation
├── contexts/
│   └── AuthContext.js          # Authentication context and hooks
├── lib/
│   └── supabase.js            # Supabase client configuration
├── screens/
│   ├── LoginScreen.js         # Login and signup screen
│   ├── UserScreen.js          # User interface for availability
│   └── LaundryGuyScreen.js    # Laundry guy interface for collections
├── supabase-schema.sql        # Database schema and functions
└── .env.example               # Example environment variables

```

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only view and modify their own data
- Laundry guys can view user profiles and availability but cannot modify them
- Authentication is handled securely through Supabase Auth

## Future Enhancements

Some ideas for expanding the app:
- Push notifications for laundry guys when new pickups are available
- History of past pickups
- Scheduling pickups in advance
- In-app messaging between users and laundry personnel
- Payment integration
- Pickup confirmation and tracking

## License

MIT
