# REFOUNDIT 🏦

> אתר החזרי מס לשכירים — בדיקת זכאות חינמית, מהירה וללא התחייבות.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Styled Components](https://img.shields.io/badge/Styled_Components-6-DB7093?logo=styled-components)

## ✨ Features

- **בדיקת זכאות אינטראקטיבית** — שאלון רב-שלבי עם תוצאות מיידיות
- **שליחת הודעות WhatsApp** — כפתור צף + אינטגרציה בכל הסקשנים
- **טופס השארת פרטים** — שם, משפחה, טלפון → נשלח למייל
- **עיצוב יוקרתי** — Navy + Teal צבעוניות מבוססת מחקר UX פיננסי
- **Responsive מלא** — מותאם לכל גודל מסך
- **אנימציות חלקות** — CSS animations + scroll-triggered reveals
- **קומפוננטות Reusable** — ארכיטקטורה מודולרית ומסודרת

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/refoundit.git
cd refoundit

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
refoundit/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── Section.jsx
│   │   │   ├── SectionTitle.jsx
│   │   │   └── Input.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── WhatsAppFAB.jsx
│   │   ├── sections/        # Page sections
│   │   │   ├── Hero.jsx
│   │   │   ├── Benefits.jsx
│   │   │   ├── Process.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── Reasons.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── FAQ.jsx
│   │   │   └── CTA.jsx
│   │   ├── quiz/            # Quiz flow
│   │   │   ├── QuizSection.jsx
│   │   │   ├── QuizStepTax.jsx
│   │   │   ├── QuizStepReasons.jsx
│   │   │   ├── QuizResult.jsx
│   │   │   └── CheckboxCard.jsx
│   │   └── contact/         # Contact section
│   │       ├── ContactSection.jsx
│   │       ├── ContactForm.jsx
│   │       └── ContactInfoCards.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useInView.js
│   │   ├── useScrollPosition.js
│   │   └── useCountUp.js
│   ├── styles/              # Global styles & theme
│   │   ├── theme.js
│   │   ├── GlobalStyles.js
│   │   └── animations.js
│   ├── data/                # Static data & constants
│   │   ├── quiz.js
│   │   ├── benefits.js
│   │   ├── faq.js
│   │   ├── testimonials.js
│   │   └── config.js
│   ├── utils/               # Utility functions
│   │   ├── whatsapp.js
│   │   └── validation.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#0A1628` | Primary backgrounds, headings |
| Teal | `#00B4A0` | CTAs, accents, success states |
| Gold | `#F5A623` | Highlights, emphasis |
| Off-White | `#F7F9FC` | Section backgrounds |

## 🛠 Tech Stack

- **React 19** — Latest with hooks & concurrent features
- **Vite 6** — Lightning-fast build tool
- **Styled Components 6** — CSS-in-JS with theme support
- **React Query 5** — Server state management (ready for API)
- **React Icons** — Icon library

## 📧 Configuration

Edit `src/data/config.js` to update:
- WhatsApp number
- Email address
- Company info

## 📄 License

MIT © REFOUNDIT
