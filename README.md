# Treat-o-Meter (v1.0.0)

A gamified habit tracker and balance manager that helps you "earn" your treats and stay accountable for your bad habits. 🍦

## 🔄 Updates
All updates are documented in [UPDATE.md](./UPDATE.md). 📝
Refer to it for the latest changes! 😉

## 🚀 Key Features

### 🎮 The Balance Game
*   **Credit System**: Earn currency by completing **Reward Tasks**. Use it to buy real-life treats!
*   **Debit System**: Lose currency for bad habits or **Punishment Tasks**.
*   **Zero-Sum Goal**: Keep your balance positive to justify your treats.

### 📋 Task Management
*   **Timed Tasks**: Set a countdown (e.g., "Study for 1 hour"). If the timer runs out, you fail!
*   **Split Tasks**: High risk, high reward. Defines a specific numeric reward for success and a punishment for failure.
*   **Permanent Habits**:
    *   Move repetitive tasks to the **Permanent Page**.
    *   Track them daily with a 5-day visual streak tracker.
    *   "Edit Mode" allows you to modify or delete permanent habits easily.

### 📊 History & Reports
*   **Transaction Log**: Every win and loss is recorded securely.
*   **PDF Export**: Generate a beautiful, watermarked PDF statement of your monthly history to keep yourself accountable.

### 👤 User Experience
*   **Google Auth**: Secure sign-in to keep your data safe.
*   **Sticker UI**: A unique, playful visual style with bold outlines and vibrant colors.
*   **Dark Mode**: Easy on the eyes for late-night grind sessions.
*   **User Guide**: Integrated "How-To" guide for new users.

## 💻 Tech Stack

**Frontend:**
*   React (Vite)
*   Tailwind CSS (Custom Utility Classes for Text Outlines)
*   Lucide React (Icons)
*   React Router DOM
*   html-to-image & jsPDF (Report Generation)

**Backend / Services:**
*   Firebase Authentication (Google Sign-In)
*   Local Storage (Data Persistence and Privacy)

## 🛠️ Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/sweet-treat-app.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🚀 Deployment

*   **Frontend**: Verified on Vercel/Netlify.
*   **Environment**: Ensure `.env` contains your Firebase config keys.

## 🔒 Security

*   **Authentication**: Handled entirely via Firebase Auth.
*   **Data**: Stored locally on the user's device (LocalStorage) for privacy and speed.
*   **Input Validation**: Strict type checking for reward/punishment values.

## 🤝 Contributing

Open issues or PRs with clear descriptions. Please follow the existing "Sticker" design language (`text-black text-outline-white`).

## 📄 License

All rights reserved. This project is proprietary. Unauthorized use, reproduction, or distribution without explicit permission is strictly prohibited.

Built with ❤️ by Hetav Shah.
