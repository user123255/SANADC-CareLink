
# SANAD CareLink
 Digital Maternal Healthcare Support Platform

SANAD CareLink is a digital maternal healthcare support platform designed to strengthen access to continuous, respectful, and confidential maternal healthcare services in underserved and hard-to-reach communities.

The project is initially focused on **Kiryandongo Refugee Settlement, Uganda**, where geographical barriers, limited healthcare resources, transportation challenges, and gaps in follow-up care can make it difficult for pregnant women to receive consistent support.

SANAD means *support or backing* in Arabic. The platform aims to strengthen the connection between mothers and healthcare workers while helping health facilities coordinate maternal healthcare services.

---

# 1. Project Overview

SANAD CareLink is a role-based healthcare platform connecting:

- **Patients:** Access their maternal healthcare information, appointments, and available healthcare support.
- **Healthcare workers:** Access authorised patient information, manage appointments, and coordinate healthcare activities.
- **Administrators:** Oversee platform operations, review staff applications, and manage authorised user activities.

The platform is intended to complement existing healthcare services, not replace healthcare professionals, antenatal care visits, emergency services, medical diagnosis, or treatment.

## 2. Problem Statement

Pregnant women in underserved communities may experience difficulties accessing continuous maternal healthcare because of:

- Long distances to healthcare facilities.
- Poor road conditions and transportation costs.
- Limited healthcare personnel and resources.
- Missed appointments and gaps in follow-up care.
- Communication barriers between patients and healthcare workers.
- Confidentiality and privacy concerns, particularly when mobile phones are shared.

These challenges can affect the continuity of maternal healthcare.

SANAD CareLink aims to address some of these challenges through accessible digital communication, appointment coordination, and improved healthcare follow-up.

 3. Project Objectives

1. Improve communication between pregnant women and healthcare workers.
2. Support appointment scheduling and follow-up coordination.
3. Help healthcare workers manage authorised patient-related activities.
4. Strengthen continuity of maternal healthcare support.
5. Promote privacy, confidentiality, and responsible handling of sensitive information.
6. Support healthcare facilities with better coordination of maternal healthcare activities.

# 4. Key Features

## Patient Dashboard

- Patient account registration and authentication.
- Patient profile access and management.
- Maternal healthcare appointment requests.
- Appointment tracking.
- Access to available maternal health information.
- Messaging and communication features.

## Healthcare Worker Dashboard

- Healthcare worker account access following verification.
- Access to authorised patient information.
- Appointment management.
- Patient communication features.
- Referral and follow-up coordination features.

## Administrator Dashboard

Administrative capabilities include:

- Reviewing healthcare worker applications.
- Approving or rejecting staff applications through the available review workflow.
- Managing authorised user accounts and roles.
- Supporting patient and healthcare worker coordination.
- Administrative oversight of platform activities.

The availability of individual administrative workflows depends on their implementation and testing.

## Additional Platform Services

The project includes service modules for:

- Appointments.
- Patient and healthcare worker profiles.
- Conversations and messages.
- Referrals.
- Healthcare information.
- Consent records.
- Audit logs.
- Staff applications and review.

Some modules and workflows continue to be integrated and tested.

## 5. Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | User interface |
| TypeScript | Application development and type safety |
| Vite 8 | Development server and production builds |
| Tailwind CSS v4 | Responsive styling |
| Firebase Authentication | User authentication |
| Cloud Firestore | Database and application data |
| Firebase Security Rules | Database access control |
| React Router | Application navigation |
| Lucide React | Interface icons |
| Oxlint | Code linting |
| Firebase CLI | Firebase project management and deployment |

**Development environment**

- Node.js 22.12 or a newer supported version.
- npm.
- Git.
- Firebase CLI.
- Visual Studio Code or another code editor.
- A Firebase project.

## 6. Project Structure

The main application structure is organized as follows:

```text
SANADC-CareLink/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminWorkspaces.tsx
│   │   ├── AuthScreen.tsx
│   │   └── HealthWorkerDashboard.tsx
│   │
│   ├── lib/
│   │   └── firebase.ts
│   │
│   ├── services/
│   │   ├── appointments.ts
│   │   ├── healthContent.ts
│   │   ├── messages.ts
│   │   ├── referrals.ts
│   │   ├── staffReview.ts
│   │   └── users.ts
│   │
│   ├── types/
│   │
│   ├── App.tsx
│   ├── AppRoot.tsx
│   ├── index.css
│   └── main.tsx
│
├── functions/
├── firestore. rules
├── firebase.json
├── package.json
├── package-lock.json
├── vite.config.ts
└── README.md
```

The structure may evolve as additional dashboards and backend services are implemented.

## 7. Installation and Setup

Follow these steps to set up SANAD CareLink locally.

### Prerequisites

Install:

1. Node.js 22.12 or a newer supported version.
2. npm.
3. Git.
4. Firebase CLI.
5. A code editor such as Visual Studio Code.
6. A Firebase project.

Verify the installations:

```bash
node --version
npm --version
git --version
firebase --version
```

### Step 1: Clone the repository

```bash
git clone https://github.com/user123255/SANADC-CareLink.git
```

Navigate into the project:

```bash
cd SANADC-CareLink
```

## Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure Firebase

Create a Firebase project through the Firebase Console:

https://console.firebase.google.com/

Enable the following services:

- Firebase Authentication.
- Cloud Firestore.
- Firebase Hosting, if deploying the application.

Configure your Firebase web application and obtain its configuration values.

Create a `.env.local` file in the project root.

Example configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the example values with the configuration values from your Firebase project.

These variable names match the Firebase configuration currently used in `src/lib/firebase.ts`.

**Important:** Never commit `.env.local` or private credentials to GitHub.

Firebase web configuration values identify your Firebase project but do not replace proper security rules. Access to sensitive data must be protected through Firebase Authentication, Firestore Security Rules, and trusted backend authorisation.

## Step 4: Configure Firestore

In the Firebase Console:

1. Open Firestore Database.
2. Create the database for your Firebase project.
3. Review the project's `firestore.rules`.
4. Configure any additional collections and indexes required by the application.
5. Test the security rules before deploying them.

Install and authenticate Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

Select the Firebase project:

```bash
firebase use YOUR_FIREBASE_PROJECT_ID
```

To deploy the Firestore rules:

```bash
firebase deploy --only firestore: rules
```

Replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID.

### Step 5: Start the development server

```bash
npm run dev
```

Open the local address displayed in the terminal, normally:

```text
http://localhost:5173
```

### Step 6: Create a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 8. Available Development Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Run TypeScript build checks and create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
| `npx tsc --noEmit` | Check TypeScript without generating output |

You can find the live application at this link: [https://sanad-carelink.web.app](url)

## 9. User Roles and Access Control

SANAD CareLink uses three primary account roles:

| Role | Access |
|---|---|
| Patient | Patient-facing services and personal records |
| Healthcare worker | Authorised patient-related information and healthcare coordination |
| Administrator | Authorised administrative operations |

Selecting a staff role during registration submits an application. It does not automatically grant administrative or healthcare worker privileges.

Staff access must be verified and provisioned through the application's authorised processes.

Security principles include:

- Role-based access control.
- Authentication before access to protected records.
- Restricted access to patient information.
- Separation of patient and staff permissions.
- Protection against unauthorised role changes.
- Consent and accountability mechanisms.

## 10. Privacy and Data Protection

SANAD CareLink is designed to handle sensitive maternal healthcare information responsibly.

The project follows these principles:

- Collect only information needed for the platform's intended functions.
- Restrict patient records to authorised users.
- Protect patient-to-worker communication.
- Avoid exposing sensitive medical information unnecessarily.
- Use authentication and database security rules.
- Maintain appropriate consent and audit mechanisms.

The platform is not a diagnostic system and does not provide medical prescriptions or independently change treatment plans.

## 11. Development Roadmap

The project is being developed incrementally.

| Area | Development status |
|---|---|
| React and TypeScript foundation | Implemented |
| Firebase project integration | Implemented |
| Patient authentication and registration | Implemented |
| Staff application registration | Implemented |
| Patient dashboard | Implemented |
| Healthcare worker dashboard | Implemented |
| Administrator dashboard | Implemented |
| Appointment management | Implemented / testing |
| Staff application review | Implemented / testing |
| Patient-worker messaging | In development |
| Referral workflows | In development |
| End-to-end security testing | Ongoing |
| Production deployment testing | Ongoing |

Features should be considered complete only after implementation and appropriate testing.

## 12. GitHub Contribution and Development Practices

Development should be transparent, incremental, and documented.

The project uses Git and GitHub to track changes and support collaborative development.

Recommended workflow:

## Create a feature branch

```bash
git checkout -b feature/health-worker-dashboard
```

### Make and test changes

```bash
npm run build
```

### Commit the work

```bash
git add.
git commit -m "feat: build healthcare worker dashboard"
```

### Push the branch

```bash
git push -u origin feature/health-worker-dashboard
```

### Create a Pull Request

Open GitHub and create a pull request from the feature branch into `main`.

After reviewing and testing the changes, merge the pull request into the main branch.

## Suggested commit conventions

- `feat:` New functionality.
- `fix:` Bug fixes.
- `docs:` Documentation changes.
- `style:` Styling changes.
- `refactor:` Code restructuring.
- `test:` Testing improvements.
- `chore:` Maintenance and configuration.

Contributors should make meaningful commits as work progresses, use feature branches, and submit pull requests for review.

**Repository integrity:** Git history should reflect the actual development process. Do not fabricate commit dates, backdate commits, or create artificial pull requests. Document work honestly and commit changes regularly.

## 13. Future Improvements

Planned improvements include:

- Further strengthening administrator workflows.
- Improving verified healthcare worker onboarding.
- Expanding secure patient assignment workflows.
- Completing patient-worker messaging workflows.
- Improving appointment and follow-up coordination.
- Low-connectivity and basic-phone access considerations.
- Language support validated with the local community.
- Accessibility and usability improvements.
- Comprehensive security and usability testing.

## 14. Project Context

**Project:** SANAD CareLink  
**Project category:** Digital Health / Maternal Healthcare  
**Initial pilot location:** Kiryandongo Refugee Settlement, Uganda  
**Primary beneficiaries:** Pregnant women and mothers  
**Other users:** Healthcare workers and health facility administrators

SANAD CareLink is being developed as a social-impact technology initiative to strengthen maternal healthcare coordination and communication in underserved communities.

## 15. License

SANAD CareLink is currently shared publicly for project demonstration and educational purposes.

No open-source license has been applied. All rights to the source code remain with the project owner. Permission is required before copying, modifying, or redistributing the code.
---

**SANAD CareLink — Supporting mothers. Connecting care. Strengthening communities.**
