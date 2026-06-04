# 🌸 Lotus Hub

> Your all-in-one student companion for studying smarter, building habits, and thriving.

![React Native](https://img.shields.io/badge/React_Native-0.74-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo-51-black?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)

---

## Features

| Module | Description |
|---|---|
| 📋 **Task Tracker** | Manage assignments with priority, due dates, subtasks, and status |
| 📚 **Grade Manager** | Track courses, assessments, and calculate weighted grades in real time |
| ✍️ **Notes & Flashcards** | Rich notes with pinning, tagging, and spaced-repetition flashcard decks |
| 🎯 **Habit Builder** | Daily/weekly habits with streaks, completion history, and 7-day visualizations |
| ⏱️ **Pomodoro Timer** | Configurable focus/break cycles, per-task tracking, session history |
| 👥 **Community** | Global feed, study groups, likes, comments, and post categories |
| 👤 **Profile & Stats** | Personal stats, achievement badges, editable profile |

---

## Tech Stack

- **React Native** + **Expo** (managed workflow)
- **TypeScript** throughout
- **Zustand** + `zustand/middleware` for state management with AsyncStorage persistence
- **React Navigation** (bottom tabs + stack)
- **Expo Linear Gradient**, **Expo Blur**, **Expo Haptics** for premium UI
- **date-fns** for date utilities
- **@expo/vector-icons** (Ionicons)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or the Expo Go app on your device

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/lotus-hub.git
cd lotus-hub

# Install dependencies
npm install

# Start the dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Using Expo Go

1. Install [Expo Go](https://expo.dev/client) on your phone
2. Run `npm start`
3. Scan the QR code

---

## Project Structure

```
lotus-hub/
├── App.tsx                    # Entry point
├── src/
│   ├── constants/
│   │   └── theme.ts           # Colors, typography, spacing, shadows
│   ├── types/
│   │   └── index.ts           # All TypeScript types
│   ├── store/
│   │   ├── userStore.ts       # User & auth state
│   │   ├── taskStore.ts       # Tasks & subtasks
│   │   ├── courseStore.ts     # Courses & assessments
│   │   ├── noteStore.ts       # Notes & flashcard decks
│   │   ├── habitStore.ts      # Habits & completions
│   │   ├── timerStore.ts      # Pomodoro timer
│   │   └── communityStore.ts  # Posts, groups, comments
│   ├── navigation/
│   │   └── RootNavigator.tsx  # Tab + stack navigator
│   ├── screens/
│   │   ├── Auth/              # Onboarding
│   │   ├── Dashboard/         # Home dashboard
│   │   ├── Tasks/             # Task manager
│   │   ├── Notes/             # Notes + flashcards
│   │   ├── Courses/           # Grade tracker
│   │   ├── Habits/            # Habit tracker
│   │   ├── Timer/             # Pomodoro timer
│   │   ├── Community/         # Feed + study groups
│   │   └── Profile/           # User profile
│   └── components/
│       ├── common/            # StatCard, etc.
│       ├── tasks/             # TaskCard
│       └── habits/            # HabitRow
```

---

## Design System

Lotus Hub uses a dark-first design with an earthy botanical palette:

| Token | Value | Usage |
|---|---|---|
| `bg` | `#0D0F14` | App background |
| `primary` | `#5B8A6F` | Lotus green — primary actions |
| `accent` | `#E8A87C` | Warm amber — highlights |
| `tasks` | `#6B8FBF` | Task module |
| `notes` | `#9B7FBF` | Notes module |
| `habits` | `#E8A87C` | Habits module |
| `timer` | `#E07070` | Timer module |
| `community` | `#7FBF9B` | Community module |

---

## Roadmap

- [ ] Cloud sync (Supabase / Firebase)
- [ ] Push notifications for task reminders
- [ ] AI study assistant (flashcard generation from notes)
- [ ] Collaborative study sessions
- [ ] Export grades to PDF
- [ ] Dark / light theme toggle
- [ ] Widget support (iOS / Android)

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a PR

---

## License

MIT © Lotus Hub
