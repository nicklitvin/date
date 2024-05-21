# Lovedu (title not finalized) (~75% complete)

An online dating platform aimed at students with features to help improve performance without predatory tactics

## Features

- Account login with Apple/Google OAuth
- Edu email verification
- Constant feed of profiles matching user's preferences
- Chat messaging 
- Subscription purchasing for premium features


## Tech Stack

Frontend: Expo, React Native, MobX

Backend: Express, NodeJS, PostgreSQL, Prisma

Testing: Jest

Additional: AWS, OAuth, Stripe

## Setup

frontend entrypoint: "/frontend/app/index.tsx"

backend entrypoint (with configurations): "/server/main.ts" 

.env file

```
POSTGRES_URL="<link to db>"

BUCKET_NAME="<for AWS S3 image storage>"
BUCKET_REGION="<for AWS S3 image storage>"
ACCESS_KEY="<for AWS S3 image storage>"
SECRET_ACCESS_KEY="<for AWS S3 image storage>"

STRIPE_API_KEY="<for creating Stripe checkout sessions>"
STRIPE_WEBHOOK="<for processing Stripe payments>"
PREMIUM_PRICE_ID="<id of premium subscription item>"
STRIPE_PAY_PORTAL="<url for managing subscription status>"

ADMIN_API_KEY="<key for accessing admin-only functions on server>"

APPLE_CLIENT_ID="<for Apple OAuth>"
ANDROID_CLIENT_ID="<for Google OAuth>"
EXPO_CLIENT_ID="<for Expo OAuth, can leave empty>"

GMAIL="<email that will send verification codes>"
GMAIL_APP_PASS="<app pass to grant access to gmail>"
```

run frontend using Android Emulator:
```
cd frontend 
npm run android
```

run backend:
```
cd server
npm start
```


