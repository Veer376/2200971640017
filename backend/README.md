# URL Shortener Microservice - Backend

This is the backend implementation of a URL Shortener Microservice as part of the evaluation assignment.

## Features

- URL shortening with optional custom shortcode
- Default validity of 30 minutes (configurable)
- URL redirection
- Statistics tracking (clicks, referrers, geolocation)
- Robust error handling

## API Endpoints

### Create Short URL
- **URL**: `/shorturls`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/some-very-long-url",
    "validity": 30,  // optional, in minutes
    "shortcode": "custom"  // optional
  }
  ```
- **Response**: 
  ```json
  {
    "shortLink": "http://localhost:5000/custom",
    "expiry": "2023-07-20T14:30:00.000Z"
  }
  ```

### Get URL Statistics
- **URL**: `/shorturls/:shortcode`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "originalUrl": "https://example.com/some-very-long-url",
    "shortCode": "custom",
    "createdAt": "2023-07-20T14:00:00.000Z",
    "expiresAt": "2023-07-20T14:30:00.000Z",
    "totalClicks": 5,
    "clickDetails": [
      {
        "timestamp": "2023-07-20T14:10:00.000Z",
        "referrer": "https://google.com",
        "location": "US, New York"
      }
    ]
  }
  ```

### Redirect to Original URL
- **URL**: `/:shortcode`
- **Method**: `GET`
- **Behavior**: Redirects to the original URL

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (if not already present)
   - Set the MongoDB connection URI and other configuration

3. Run the server:
   ```
   # Development
   npm run dev

   # Production
   npm start
   ```

## Dependencies

- Express - Web framework
- Mongoose - MongoDB ODM
- nanoid - For generating short codes
- valid-url - For URL validation
- geoip-lite - For geolocation tracking
- express-validator - For request validation
- Custom Logging Middleware - For consistent logging across the application
