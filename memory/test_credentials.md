# Test Credentials

## Admin (CMS)
- Email and password are set in `backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — not committed here on purpose.
- Role: `admin`

## Auth Endpoints
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

## Public API
- GET `/api/blogs` (public, supports ?category=&search=&limit=&skip=)
- GET `/api/blogs/:slug`
- POST `/api/blogs/:slug/like`
- POST `/api/blogs/:slug/comments`
- GET `/api/authors`
- GET `/api/authors/:id`
- POST `/api/newsletter`
- GET `/api/categories`

## Admin API (protected)
- POST `/api/admin/blogs`
- PUT `/api/admin/blogs/:id`
- DELETE `/api/admin/blogs/:id`
- GET `/api/admin/stats`
