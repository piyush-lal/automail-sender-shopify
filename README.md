# AutoMail Sender (Shopify Partners)

🚀 **Live Demo:** [https://automail-sender-shopify.netlify.app/](https://automail-sender-shopify.netlify.app/)

## Project Scope
**AutoMail Sender** is a completely free, powerful, and easy-to-use bulk emailing platform designed specifically for outreach to Shopify Partners. 
Anyone can use this tool to discover and send bulk emails to Shopify partners, invite them to collaborate, or pitch partnership opportunities. 

### Key Features:
- 📧 **Bulk Emailing:** Send customized messages to thousands of Shopify partners seamlessly in the background.
- 📎 **Attachments:** Attach a single file (like a PDF proposal, image, or document) to your bulk email campaign.
- 🎯 **Personalization:** Dynamically customize messages using variables like `{name}` or `{url}` for every recipient.
- 📊 **Real-Time Tracking:** Track Sent, Failed, and Unsent emails directly from the dashboard.
- 🚫 **Do Not Send List:** Easily manage contacts you want to exclude from future campaigns.
- 🔐 **Admin Portal:** Comprehensive user management and email log monitoring for admins.

---

## 🛠️ Local Setup Guide

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or a local MongoDB instance)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/piyush-lal/automail-sender-shopify.git
cd email_sender
npm install
```

### 3. Environment Variables
Rename the `.env.example` file to `.env.local` and fill in the required credentials:
```bash
cp .env.example .env.local
```

Inside `.env.local`, ensure you have:
```env
MONGODB_URI="mongodb://localhost:27017/your_database_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_key_here"
```

### 4. Running the Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📬 Contact Me

If you have any questions, need help setting up the project, or want to collaborate, feel free to reach out to me!

- **Instagram:** [piyush_lal_9](https://www.instagram.com/piyush_lal_9/)
- **LinkedIn:** [Piyush Lal](https://www.linkedin.com/in/piyush-lal)
- **Email:** [pppv195@gmail.com](mailto:pppv195@gmail.com)

---
*Built with ❤️ for the open-source community.*