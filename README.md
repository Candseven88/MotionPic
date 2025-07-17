# PixWall - AI Wallpaper Generator

A web application for generating beautiful wallpapers and videos using AI models with user authentication.

## Features

- **User Authentication**: Secure login, registration, and anonymous login using Firebase Auth
- **Text-to-Image Generation**: Generate high-quality images from text descriptions using SiliconFlow's Kolors model
- **Image-to-Video Generation**: Create animated videos from images using ZhipuAI's CogVideoX model
- **Local Storage**: All generated content is saved locally for easy access
- **History Management**: View and download all your generated content
- **Modern UI**: Clean and responsive interface built with Next.js and Tailwind CSS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for SiliconFlow and ZhipuAI
- Firebase project for authentication

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pixwall
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
cp env.example .env.local
```

4. Add your API keys and Firebase configuration to `.env.local`:
```env
# API Keys
SILICONFLOW_API_KEY=your_siliconflow_api_key_here
ZHIPUAI_API_KEY=your_zhipuai_api_key_here

# Firebase配置
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# PayPal Integration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Firebase Setup

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

Quick setup:
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password and Anonymous authentication
3. Add a web app to your project
4. Copy the configuration values to your `.env.local` file

## Getting API Keys

### SiliconFlow API Key
1. Visit [SiliconFlow](https://docs.siliconflow.cn/cn/userguide/use-docs-with-cursor)
2. Sign up for an account
3. Navigate to API settings
4. Generate your API key

### ZhipuAI API Key
1. Visit [ZhipuAI](https://www.bigmodel.cn/dev/api/videomodel/cogvideox)
2. Sign up for an account
3. Navigate to API settings
4. Generate your API key

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Authentication:
   - **First Visit**: You'll be redirected to the login page
   - **Anonymous Login**: Click "匿名登录" to start using immediately without registration
   - **Register**: Click "注册新账户" to create a new account
   - **Login**: Enter your email and password
   - **Logout**: Click the logout button in the top-right corner

4. Use the application:
   - **Generate Image**: Enter a text description and generate an image
   - **Generate Video**: Provide an image URL and animation prompt to create a video
   - **History**: View and download all your generated content

## API Endpoints

- `POST /api/generate-image`: Generate image from text prompt
- `POST /api/generate-video`: Start video generation from image
- `GET /api/generate-video?taskId=<id>`: Get video generation result
- `GET /api/history`: Get all generated files

## File Storage

Generated files are stored in the `public/generated/` directory:
- Images: `image_<timestamp>.png`
- Videos: `video_<timestamp>.mp4`
- Video covers: `cover_<timestamp>.png`

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: Firebase Auth
- **Image Generation**: SiliconFlow Kolors API
- **Video Generation**: ZhipuAI CogVideoX API

## Project Structure

```
pixwall/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── test-auth/         # Authentication test page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ImageGenerator.tsx # Image generation component
│   ├── VideoGenerator.tsx # Video generation component
│   ├── History.tsx        # History component
│   └── Login.tsx          # Authentication component
├── lib/                   # Utility libraries
│   ├── api.ts            # API services
│   ├── firebase.ts       # Firebase configuration
│   └── AuthContext.tsx   # Authentication context
├── public/               # Static files
│   └── generated/        # Generated content storage
└── package.json          # Dependencies and scripts
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Authentication Features

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Anonymous login (no registration required)
- ✅ Secure logout functionality
- ✅ Authentication state persistence
- ✅ Protected routes
- ✅ User information display
- ✅ Anonymous user identification
- ✅ Loading states and error handling

## User Types

### Anonymous Users
- Can use all features immediately
- Data stored locally in browser
- Data lost after logout
- Orange user icon and "匿名用户" label
- Warning banner about data persistence

### Registered Users
- Full account functionality
- Data persists across sessions
- Email address displayed
- Gray user icon
- Data can be synced across devices

## Notes

- The application interface is in Chinese as per requirements
- Chinese text can be entered in the prompt fields for generation
- Generated content is automatically saved locally
- Video generation is asynchronous and may take several minutes
- API keys are required for both image and video generation features
- Firebase authentication is required to access the application
- Anonymous users can start using immediately without registration

## License

MIT License 