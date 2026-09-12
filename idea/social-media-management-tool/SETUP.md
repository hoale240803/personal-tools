# 🚀 Setup Instructions (5 minutes)

## Step 1: Download
Download the `social-content-manager-app` folder to your computer.

## Step 2: Navigate to folder
```bash
cd social-content-manager-app
```

## Step 3: Install dependencies
```bash
npm install
```
(This may take 1-2 minutes)

## Step 4: Run the app
```bash
npm run dev
```

## Step 5: Open in browser
The app will automatically open at `http://localhost:3000`

If not, manually open: **http://localhost:3000**

---

## 🎮 Demo Account

You can login with any email/password combination:
- Email: `demo@example.com`
- Password: `anything`

---

## ✨ What to try

1. **Upload an image** - Try dragging & dropping an image file
2. **Fill post details** - Add description, hashtags, select platforms
3. **Review post** - See preview before publishing
4. **Watch AI animation** - 3-second loading animation
5. **Check history** - See published posts with different statuses
6. **Configure settings** - Connect/disconnect platforms, enable notifications

---

## 📁 Folder Structure

```
social-content-manager-app/
├── src/
│   ├── components/        ← All React components
│   ├── App.jsx           ← Main component
│   └── index.css         ← Styles
├── index.html            ← HTML page
├── package.json          ← Dependencies
└── README.md             ← Full documentation
```

---

## 🆘 Troubleshooting

### "npm: command not found"
→ Install Node.js from https://nodejs.org

### "Port 3000 already in use"
→ The app will use next available port (3001, 3002, etc.)

### "Module not found"
→ Delete `node_modules` folder and run `npm install` again

### Styles not loading
→ Try restarting the server: Press `Ctrl+C` then `npm run dev`

---

## 🎓 For Integration with AISE

When ready to integrate this into your AISE framework:

1. Move this to: `social-media-management-tool/app/`
2. Update AISE configuration to load this React app
3. Connect backend APIs for real data
4. Replace mock data with real database queries

---

**You're all set! Happy coding! 🎉**
