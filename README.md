# StudySaathi — Your Personal Study Companion

StudySaathi is a responsive study-planning web app built with React and Vite. It helps learners organise study tasks, draft a daily plan, practise foundational CS questions, and focus with a Pomodoro-style timer.

## Features

- Responsive dashboard with study stats
- Add, complete, and delete study tasks
- Add subjects and set a daily task goal
- Create a draft study schedule from available time and subjects
- Built-in quiz with answers and explanations
- Focus timer with 15, 25, and 45 minute presets
- Local browser storage for tasks, subjects, goal, and exam date
- No paid API keys required

## Tech stack

- React
- Vite
- CSS
- Lucide icons
- Browser localStorage

## Run locally

1. Install [Node.js](https://nodejs.org/) (LTS version).
2. Download or clone this repository.
3. Open the project folder in VS Code.
4. Open the VS Code terminal and run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Important notes

- This starter version stores personal task and subject data in the current browser on the current device. It does not yet include accounts or cloud sync.
- The study plan is a rule-based draft, not an AI-generated recommendation. Review and adjust it to your needs.
- The quiz currently contains sample web-development and computer-science questions.
- Do not enter sensitive personal information.

## Roadmap

- Optional account login and cloud sync
- Editable syllabus topics and exam calendar
- More subject-specific question sets
- Accessibility improvements and automated tests

## License

MIT
