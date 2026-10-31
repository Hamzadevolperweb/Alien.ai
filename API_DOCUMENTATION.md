# Alien.ai API

All endpoints are rooted at `/api`. Successful responses use:

```json
{ "success": true, "data": {}, "error": null }
```

Errors use:

```json
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "Description" } }
```

## Authentication

Supabase must be used by the frontend to sign users up, sign in, reset passwords, refresh tokens, and obtain the access token. Protected endpoints require:

```http
Authorization: Bearer <supabase-access-token>
```

## Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/api/health` | No | Health check |
| GET/PATCH | `/api/me` | Yes | Read/update profile |
| POST | `/api/account/delete` | Yes | Delete authenticated account |
| GET/POST | `/api/projects` | Yes | List/create projects |
| GET/PATCH/DELETE | `/api/projects/:id` | Yes | Manage owned project |
| POST | `/api/generations/image` | Yes | Create OpenAI image generation |
| POST | `/api/generations/video` | Yes | Create asynchronous Runway text-to-video task |
| POST | `/api/generations/image-to-video` | Yes | Create asynchronous Runway image-to-video task |
| GET | `/api/generations` | Yes | List generations |
| GET | `/api/generations/:id` | Yes | Read generation and refresh provider status |
| DELETE | `/api/generations/:id` | Yes | Delete owned generation |
| POST/DELETE | `/api/uploads` and `/api/uploads/:path(*)` | Yes | Upload/delete private media |
| GET | `/api/media/:path(*)` | Yes | Create one-hour signed media URL |
| GET | `/api/credits` | Yes | Current balance |
| GET | `/api/credits/transactions` | Yes | Credit history |
| GET | `/api/credits/estimate?type=image|video|image-to-video` | No | Server-configured estimate |

## Image request

```json
{
  "project_id": null,
  "prompt": "A glass house in a rainy forest",
  "size": "1024x1024",
  "idempotency_key": "optional-client-key"
}
```

## Video request

```json
{
  "prompt": "A cinematic drone shot over a neon city",
  "ratio": "1280:720",
  "duration": 5,
  "idempotency_key": "optional-client-key"
}
```

Image-to-video additionally requires a private storage path converted to a provider-accessible URL:

```json
{ "prompt": "Animate this scene", "image_uri": "https://provider-accessible-reference.example/image.png" }
```

## Video frontend flow

1. POST `/api/generations/video` and store the returned generation `id`.
2. Poll GET `/api/generations/:id` every 10 seconds.
3. Stop when `status` is `completed`, `failed`, or `cancelled`.
4. For completed media, request `GET /api/media/<output_media_path>` to obtain a temporary signed URL.

`idempotency_key` is strongly recommended for generation and payment-like POST operations. The backend rejects negative balances and charges are tracked by server-side configuration.
