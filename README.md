# 🎵 Wavify — Music Streaming Web App

A full-featured music streaming web application inspired by Spotify and Apple Music.
Built as a school class project for educational purposes only.

## ✨ Features

- 🎧 **YouTube IFrame Player** — stream official music videos legally
- 🏠 **Rich Home Page** — hero banner, quick access, trending, genres, mood playlists
- 🔍 **Instant Search** — search songs, artists, albums, genres, playlists
- 👤 **Artist Pages** — biography, popular songs, albums, similar artists, follow/like
- 💿 **Album Pages** — cover art, track list, duration, play/shuffle
- 📋 **Playlist System** — create, rename, delete, duplicate, pin, search inside
- ❤️ **Favorites** — like songs, albums, artists, playlists
- 📚 **Library** — playlists, saved albums, followed artists
- 🕒 **Listening History** — recently played, most played, continue listening
- 🎛️ **Full Player Controls** — play/pause, next/prev, seek, volume, shuffle, repeat (off/all/one)
- 📋 **Queue Management** — add to queue, play next, remove, reorder
- 🖥️ **Fullscreen Player** — immersive expanded player view
- 🌙 **Dark/Light Mode** — toggle between themes
- 🎨 **7 Accent Colors** — green, purple, blue, red, orange, pink, cyan
- 📱 **Responsive** — desktop, tablet, mobile
- 🔐 **Auth System** — login, register, forgot password (localStorage)
- 🔔 **Toast Notifications** — beautiful feedback for all actions
- 🎸 **Genre Browser** — 13 genres with dedicated pages
- 🎭 **Mood Playlists** — happy, sad, energetic, romantic, chill, focus

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser to http://localhost:5173
```

That's it! The app works **without any API key** using curated mock data.

### Demo Account
Click "Use demo account" on the login page, or manually enter:
- **Email:** `demo@wavify.com`
- **Password:** `demo123`

## 🔑 YouTube API Key (Optional)

For live search results beyond the built-in songs, get a free YouTube Data API v3 key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Create credentials → **API Key**
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Add your key:
   ```
   VITE_YOUTUBE_API_KEY=AIzaSy...yourkey...
   ```
6. Restart the dev server

The free tier gives **10,000 units/day** — more than enough for a demo.

## 🏗️ Tech Stack

| Technology | Version |
|---|---|
| React | 18 |
| Vite | 8 |
| Tailwind CSS | 3 |
| Framer Motion | 12 |
| React Router | 7 |
| Axios | 1 |
| Lucide React | latest |
| React Hot Toast | 2 |

## 📁 Folder Structure

```
src/
├── assets/
├── components/
│   ├── navigation/       # Sidebar, TopBar, MobileNav
│   ├── player/           # BottomPlayer, FullscreenPlayer, QueuePanel
│   └── ui/               # Cards, TrackRow, Avatar, Skeleton, ContextMenu, SectionRow
├── context/
│   ├── AuthContext.jsx   # Login/Register/Logout
│   ├── LibraryContext.jsx # Likes, Playlists, History, Following
│   ├── PlayerContext.jsx  # YouTube player state & controls
│   └── ThemeContext.jsx   # Dark/Light mode, Accent color
├── pages/
│   ├── auth/             # LoginPage, RegisterPage, ForgotPasswordPage
│   └── app/              # HomePage, SearchPage, ArtistPage, AlbumPage,
│                         # PlaylistPage, GenrePage, LikedSongsPage,
│                         # LibraryPage, FavoritesPage, HistoryPage,
│                         # ProfilePage, SettingsPage
├── services/
│   ├── mockData.js       # Curated songs, artists, albums with YouTube IDs
│   ├── storageService.js # localStorage CRUD helpers
│   └── youtubeService.js # YouTube Data API v3 wrapper
├── App.jsx               # Root component, routing, YouTube player mount
├── main.jsx              # React entry point
└── index.css             # Global styles, glassmorphism, animations
```

## 📝 Notes

- All music is streamed through YouTube's official player — no copyrighted files are stored
- Authentication and all user data is stored locally in your browser (localStorage)
- This app is for **educational purposes only** and is not intended for commercial use

## 🎵 Included Songs

| Song | Artist |
|---|---|
| Blinding Lights | The Weeknd |
| Shape of You | Ed Sheeran |
| Die With A Smile | Lady Gaga & Bruno Mars |
| Flowers | Miley Cyrus |
| Espresso | Sabrina Carpenter |
| As It Was | Harry Styles |
| Bad Habits | Ed Sheeran |
| Cruel Summer | Taylor Swift |
| Anti-Hero | Taylor Swift |
| Levitating | Dua Lipa |
| Heat Waves | Glass Animals |
| bad guy | Billie Eilish |
| drivers license | Olivia Rodrigo |
| Dynamite | BTS |
| Butter | BTS |
| Uptown Funk | Bruno Mars |
| Stay | The Kid LAROI & Justin Bieber |
| Night Changes | One Direction |
| Happier | Olivia Rodrigo |
| Save Your Tears | The Weeknd |

---

*Wavify — School Project — Not for commercial use*
