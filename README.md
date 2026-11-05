# TabrikUZ · HALLAYM Invite

Premium invitation and greeting builder for birthdays, weddings, university and corporate events.

Node.js + Express + MongoDB (optional in development). No payment credentials are committed; paid publishing is disabled until an official payment adapter is configured and verified.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Open http://localhost:3000. Set MONGODB_URI for durable user and invitation storage. In-memory storage without MongoDB is for demos only and resets after restart.

## Features

- Public landing, gallery, category filtering and premium interactive preview
- Accounts, login, personal invitations, create/edit/delete, RSVP and greetings
- Birthday/wedding/event/love categories and configurable themes
- Admin insights (set ADMIN_EMAIL before registration)
- Preview publishing is free for demo use; real-money checkout is not active until backend payment verification is implemented.

## Deploy

Render Node web service: build `npm install`, start `npm start`; configure `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `PUBLIC_URL` in Render. Never store secrets in GitHub.
