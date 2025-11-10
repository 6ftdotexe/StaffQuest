# StaffQuest

StaffQuest is a gamified training and motivation web app for restaurant employees. It turns everyday tasks into “quests” with XP, levels, streaks, and lightweight manager tools – built as a front-end prototype using HTML, CSS, and JavaScript (no backend).

## Features

- 🎮 **Gamified training for employees**  
  Employees choose their profile, complete quests (daily, weekly, core), earn XP, level up, and unlock achievements.

- 📊 **Live progress, XP, and streaks**  
  Each employee has a profile with total XP, level, quests completed, **XP earned today**, and **login streak** calculated from quest history.

- 😄 **Shift mood check-ins**  
  Quick emoji-based mood buttons let employees log how their shift felt today (stored per employee in `localStorage`).

- 🧩 **Quest system with difficulty and filters**  
  Quests have category, type (daily/weekly/core), XP value, and auto-labeled difficulty (Easy/Normal/Hard), plus filters and a “Random Quest” button.

- 🧑‍💼 **Manager dashboard with team insights**  
  Manager view (protected by a demo PIN `1234`) shows a team table, **team XP summary**, **today’s shift summary** (quests & XP today + most active employee), top performers, and a quest editor.

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- No frameworks, no backend
- Uses `localStorage` for demo data persistence in the browser

## Getting Started

1. Clone or download the repo.
2. Open `index.html` directly in your browser **or** run a simple server, for example:
   ```bash
   python -m http.server
