# 🏛️ Qorvan

<p align="center">
  <a href="https://www.qorvan.org">
    <img src="public/favicon.ico" alt="Qorvan Logo" width="80" height="80" />
  </a>
</p>

<h3 align="center">Empowering Communities • Driving Social Impact • Transparent Philanthropy</h3>

<p align="center">
  A modern, high-performance web platform and administrative dashboard built for <b>Qorvan</b> using Next.js 16, React 19, TypeScript, Tailwind CSS, MongoDB, and Clerk Auth.
</p>

<p align="center">
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs" alt="Next.js"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb" alt="MongoDB"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk"></a>
</p>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
  - [🌐 Public Web Portal](#-public-web-portal)
  - [⚙️ Admin Management Dashboard](#%EF%B8%8F-admin-management-dashboard)
- [💻 Tech Stack](#-tech-stack)
- [📂 Project Architecture](#-project-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [🔑 Environment Variables](#-environment-variables)
- [🛡️ Security & Role-Based Access Control (RBAC)](#%EF%B8%8F-security--role-based-access-control-rbac)
- [📜 Available Scripts](#-available-scripts)
- [📄 License & Authors](#-license--authors)

---

## 🌟 Features

### 🌐 Public Web Portal

- **Dynamic Homepage**: Hero section, mission highlights, key impact metrics, and recent activity feeds.
- **Projects & Initiatives**: Interactive showcases of ongoing and completed humanitarian projects with dynamic filtering.
- **Photo & Video Gallery**: Categorized media gallery powered by interactive lightbox & smooth grid layouts.
- **Volunteer & Career Applications**: Integrated forms allowing users to apply for volunteer positions and careers directly.
- **News & Announcements**: Dynamic publishing platform for foundation updates, news articles, and press releases.
- **Contact & Feedback**: Direct contact form with server-side email notifications (`Nodemailer` integration).
- **Internationalization (i18n)**: Locale-aware routing and multi-language support (`[locale]`).
- **Responsive & Accessible**: Optimized for mobile, tablet, and desktop viewports with WCAG accessibility standards.

### ⚙️ Admin Management Dashboard

- **Real-Time Analytics & Impact Statistics**: Visualization of key metrics using `Recharts` and `Chart.js`.
- **Content Management System (CMS)**:
  - **TipTap Rich Text Editor**: Custom WYSIWYG editor supporting blockquotes, code blocks, highlights, images, and alignments.
  - Dynamic page creation and custom slug routing.
- **Media Library Manager**: Centralized asset upload and management using `UploadThing`.
- **Application Processing**: Management workflows for incoming volunteer and career applications.
- **User & Permission Control**: Granular permission matrix for managing administrative staff, authors, and moderators.
- **System Maintenance Toggle**: One-click maintenance mode flag with dynamic middleware routing.

---

## 💻 Tech Stack

| Domain                   | Technologies                                                                                                                                                          |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core Framework**       | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 6](https://www.typescriptlang.org/)                                       |
| **Styling & UI**         | [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **Database & ORM**       | [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/)                                                                                              |
| **Authentication**       | [Clerk Auth](https://clerk.com/) (`@clerk/nextjs`)                                                                                                                    |
| **Rich Text & Media**    | [TipTap Editor](https://tiptap.dev/), [UploadThing](https://uploadthing.com/), `react-fast-marquee`, `embla-carousel`                                                 |
| **Data Viz & Utilities** | [Recharts](https://recharts.org/), [Chart.js](https://www.chartjs.org/), `jspdf`, `html2canvas`, `qrcode.react`                                                       |
| **Email & Services**     | [Nodemailer](https://nodemailer.com/), `Axios`, `Zod` validation                                                                                                      |

---

## 📂 Project Architecture

```
qorvan/
├── app/                      # Next.js App Router Structure
│   ├── (auth)/               # Auth routes (Sign-In, Sign-Up)
│   ├── (root)/               # Main public web pages (Home, Projects, Gallery, Contact)
│   ├── [locale]/             # i18n dynamic locale routes
│   ├── api/                  # API endpoints (UploadThing, webhooks, contact)
│   ├── dashboard/            # Administrative dashboard pages
│   │   ├── career-applications/
│   │   ├── contact-messages/
│   │   ├── gallery/
│   │   ├── homepage/
│   │   ├── impact-statistics/
│   │   ├── media/
│   │   ├── projects/
│   │   ├── users/
│   │   └── volunteer-applications/
│   ├── globals.css           # Global Tailwind CSS styles
│   └── layout.tsx            # Master layout wrapper with Clerk Provider
├── components/
│   ├── shared/               # Reusable shared components (Header, Footer, RichTextEditor, MediaLibrary)
│   └── ui/                   # Radix UI primitives & design tokens
├── constants/                # Navigation routes, static links & RBAC permissions
├── hooks/                    # Custom React hooks
├── lib/                      # Database connectors (Mongoose), mailer, and utility helpers
├── messages/                 # i18n translation dictionaries
├── public/                   # Static public assets, icons, and logos
├── types/                    # TypeScript interfaces & type definitions
├── next.config.ts            # Next.js build configuration
├── tailwind.config.ts        # Tailwind CSS theme extension
└── package.json              # Project dependencies & npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher (or `pnpm` / `yarn`)
- **MongoDB Database**: Local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ninazmul/qorvan.git
   cd qorvan
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env.local` file in the root directory by copying `.env.example` or creating it manually:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your operational API keys and credentials (see [Environment Variables](#-environment-variables) below).

### Running the Application

1. **Start the local development server:**

   ```bash
   npm run dev
   ```

2. **Open the browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the public application.
   Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the admin portal.

---

## 🔑 Environment Variables

| Variable                            | Description                                                     |
| :---------------------------------- | :-------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key for Clerk Authentication frontend SDK                |
| `CLERK_SECRET_KEY`                  | Private secret key for Clerk Backend authentication             |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Route redirect path for sign-in (`/sign-in`)                    |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Route redirect path for sign-up (`/sign-up`)                    |
| `MONGODB_URI`                       | MongoDB connection URI string                                   |
| `UPLOADTHING_TOKEN`                 | Secret API token for UploadThing cloud media storage            |
| `NEXT_PUBLIC_SERVER_URL`            | Public production URL base                                      |
| `CONTACT_RECEIVER`                  | Email address receiving contact form submissions                |
| `EMAIL_USER` / `EMAIL_PASS`         | SMTP email server credentials for outbound messaging            |
| `SMTP_HOST` / `SMTP_PORT`           | Outbound mail server configuration (`smtp.gmail.com`, `465`)    |
| `MAINTENANCE_MODE`                  | Boolean flag (`true`/`false`) to activate maintenance mode page |

---

## 🛡️ Security & Role-Based Access Control (RBAC)

Qorvan utilizes a robust RBAC architecture:

- **Authentication**: Secured via Clerk Middleware protecting `/dashboard` and backend API endpoints.
- **Granular Permissions**: Managed via `constants/permissions.ts` defining user roles (Super Admin, Admin, Content Manager, Editor, Viewer).
- **Data Protection**: Input validation powered by `Zod` schemas and sanitized rich text rendering to prevent XSS attacks.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command         | Action                                                       |
| :-------------- | :----------------------------------------------------------- |
| `npm run dev`   | Runs the app in development mode with Webpack hot reloading. |
| `npm run build` | Builds the production-optimized application bundle.          |
| `npm run start` | Starts the production Next.js server.                        |
| `npm run lint`  | Runs ESLint checks across TypeScript and React code.         |

---

## 📄 License & Authors

- **Author**: Nazmul ([@ninazmul](https://github.com/ninazmul)) - `nazmulsaw@gmail.com`
- **Organization**: [Qorvan](https://www.qorvan.org)
- **License**: MIT License
