# Social Content Manager - Interactive Demo

A fully interactive React app for managing and publishing social media content across multiple platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. **Extract the folder** to your local machine

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in browser**
- The app will automatically open at `http://localhost:3000`
- Or manually navigate to that URL

## 📱 Features

### 1. **Login Screen**
- Email & password authentication
- Social login buttons (UI only)
- Remember me checkbox
- Sign up link

### 2. **Create Post Flow** (3-step wizard)

**Step 1: Image Upload**
- Drag & drop or click to upload
- Image preview
- File validation

**Step 2: Post Details**
- Select content type (General, Product, Promo)
- Write description
- Add hashtags
- Select platforms (TikTok, Instagram, Facebook)

**Step 3: Review & Edit**
- Preview post
- Edit buttons for caption & hashtags
- Platform selection display

### 3. **AI Preparing State**
- Loading animation with progress
- Task checklist showing what AI is doing
- Simulated 3-second processing

### 4. **Publish Result**
- Success/Error state display
- Platform publishing details
- Statistics summary
- Create new post button

### 5. **History Screen**
- View all published posts
- Filter by status (All, Published, Draft, Failed)
- Platform badges
- Action buttons (View, Share, Delete)

### 6. **Settings Screen**
- Social media connections management
- Notification preferences
- Style profile selection
- Help & support links

## 🎨 Design System

### Colors
- **Primary**: `#7C3AED` (Purple)
- **Secondary**: `#3B82F6` (Blue)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)

### Tailwind CSS
Custom components included:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-success` - Success button
- `.btn-outline` - Outline button
- `.card` - Standard card
- `.card-lg` - Large card
- `.input-field` - Form input

## 📂 Project Structure

```
social-content-manager-app/
├── src/
│   ├── components/
│   │   ├── App.jsx                 # Main app component
│   │   ├── LoginScreen.jsx         # Login page
│   │   ├── Dashboard.jsx           # Main dashboard layout
│   │   ├── CreatePostFlow.jsx      # Multi-step post creation
│   │   ├── ReviewPost.jsx          # Review & edit screen
│   │   ├── AIPreparingState.jsx    # Loading animation
│   │   ├── PublishResult.jsx       # Success/error screen
│   │   ├── HistoryScreen.jsx       # Post history view
│   │   └── SettingsScreen.jsx      # Settings & preferences
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind & global styles
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🛠️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## 📝 Demo Flow

1. **Login** with any email/password
2. **Create Post**:
   - Upload an image (any image works, you can use placeholder)
   - Fill in post details
   - Review & confirm
   - Watch AI preparation
   - See publish result
3. **Check History** - See your published posts
4. **Adjust Settings** - Connect platforms, change preferences

## 🎯 Interactive Features

✅ Full form interaction  
✅ Image upload & preview  
✅ Multi-step wizard  
✅ Loading animations  
✅ State management with React hooks  
✅ Responsive design  
✅ Platform selection  
✅ Mock data in history  

## 💡 Customization

### Add More Platforms
Edit `PLATFORMS` array in `CreatePostFlow.jsx`:
```javascript
const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  // Add more...
]
```

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: "#YOUR_COLOR",
  secondary: "#YOUR_COLOR",
  // etc...
}
```

### Modify Mock Data
Edit mock data arrays in:
- `HistoryScreen.jsx` - Post history
- `SettingsScreen.jsx` - Connected platforms

## 🚨 Troubleshooting

### Port 3000 already in use?
Edit `vite.config.js`:
```javascript
server: {
  port: 3001, // Change to another port
}
```

### Styles not loading?
Make sure you ran `npm install` correctly and all node_modules are present.

### Image upload not working?
Check browser console for errors. This is a mock demo - actual upload would need a backend.

## 📚 Technologies Used

- **React 18** - UI library
- **Vite** - Build tool (fast development)
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **JavaScript (ES6+)** - Modern JavaScript

## 📄 License

Free to use for personal and commercial projects.

---

## 🎓 Next Steps for Real Implementation

When building the actual Social Content Manager:

1. **Backend Integration**
   - Replace mock data with real API calls
   - Implement actual authentication
   - Connect to social media APIs (Meta, TikTok, etc.)

2. **Database**
   - Store posts, history, settings
   - User accounts & sessions

3. **File Upload**
   - Implement actual image upload
   - Cloud storage integration

4. **Real AI**
   - Integrate Claude API or similar
   - Generate actual captions, hashtags, CTAs

5. **Social Media APIs**
   - Implement actual posting
   - Real-time status updates

6. **Analytics**
   - Track post performance
   - Engagement metrics

---

**Enjoy your Social Content Manager demo! 🚀**

For questions or issues, check the component files for inline comments.
