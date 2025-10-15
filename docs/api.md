# VOD Platform API Documentation

## Base URL
```
Development: http://localhost:4000/api/v1
Production: https://your-api-domain.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained via Supabase Authentication.

---

## Auth Endpoints

### Sign Up
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Sign In
```http
POST /auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "session": { ... },
  "user": { ... }
}
```

---

## Videos Endpoints

### Get All Videos
```http
GET /videos
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string)
- `category` (string, category slug)
- `featured` (boolean)
- `sort` (string: created_at, views_count, rating)
- `order` (string: asc, desc)

**Response:**
```json
{
  "videos": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get Single Video
```http
GET /videos/:id
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Video Title",
  "description": "...",
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "duration": 7200,
  "release_year": 2023,
  "views_count": 1234,
  "categories": [...]
}
```

### Create Video (Admin Only)
```http
POST /videos
```

**Request Body:**
```json
{
  "title": "Video Title",
  "description": "Description",
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "poster_url": "https://...",
  "duration": 7200,
  "release_year": 2023,
  "published": true,
  "categories": ["category-uuid-1", "category-uuid-2"]
}
```

### Update Video (Admin Only)
```http
PUT /videos/:id
```

### Delete Video (Admin Only)
```http
DELETE /videos/:id
```

---

## Categories Endpoints

### Get All Categories
```http
GET /categories
```

### Get Single Category
```http
GET /categories/:slug
```

### Create Category (Admin Only)
```http
POST /categories
```

**Request Body:**
```json
{
  "name": "Action",
  "slug": "action",
  "description": "Action movies"
}
```

---

## Ratings Endpoints

### Get Video Ratings
```http
GET /ratings/video/:videoId
```

**Response:**
```json
{
  "ratings": [...],
  "average": 8.5,
  "count": 42
}
```

### Rate Video
```http
POST /ratings/video/:videoId
```

**Request Body:**
```json
{
  "rating": 9
}
```

---

## Comments Endpoints

### Get Video Comments
```http
GET /comments/video/:videoId
```

### Create Comment
```http
POST /comments/video/:videoId
```

**Request Body:**
```json
{
  "content": "Great movie!",
  "parent_id": "optional-parent-comment-uuid"
}
```

### Update Comment
```http
PUT /comments/:id
```

### Delete Comment
```http
DELETE /comments/:id
```

---

## Favorites Endpoints

### Get User Favorites
```http
GET /favorites
```

### Check if Video is Favorited
```http
GET /favorites/video/:videoId
```

### Add to Favorites
```http
POST /favorites/video/:videoId
```

### Remove from Favorites
```http
DELETE /favorites/video/:videoId
```

---

## Watch History Endpoints

### Get Watch History
```http
GET /watch-history
```

### Get Watch Position
```http
GET /watch-history/video/:videoId
```

### Update Watch Position
```http
POST /watch-history/video/:videoId
```

**Request Body:**
```json
{
  "watch_position": 1234,
  "completed": false
}
```

---

## Stripe Endpoints

### Create Checkout Session
```http
POST /stripe/create-checkout-session
```

**Request Body:**
```json
{
  "priceId": "price_xxxxx"
}
```

**Response:**
```json
{
  "sessionId": "cs_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

### Create Portal Session
```http
POST /stripe/create-portal-session
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Webhook
```http
POST /stripe/webhook
```

---

## Upload Endpoints (Admin Only)

### Upload Video
```http
POST /upload/video
```

**Request:** `multipart/form-data` with `video` field

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "url": "https://...",
  "path": "videos/..."
}
```

### Upload Thumbnail
```http
POST /upload/thumbnail
```

### Upload Poster
```http
POST /upload/poster
```

### Delete File
```http
DELETE /upload/:bucket/:path?fullPath=...
```

---

## Users Endpoints

### Get Current User
```http
GET /users/me
```

### Update Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "bio": "...",
  "avatar_url": "https://..."
}
```

### Get All Users (Admin Only)
```http
GET /users
```

### Update User (Admin Only)
```http
PUT /users/:id
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "errors": [...]  // Optional validation errors
  }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Returns `429 Too Many Requests` when exceeded

