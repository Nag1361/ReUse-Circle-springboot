# API guide

Base URL: `http://localhost:8080/api`.

For secured routes, send `Authorization: Bearer YOUR_TOKEN`. For JSON bodies, send `Content-Type: application/json`. No cookies or OAuth2 are used. IDs are numbers. Responses contain DTOs only, never password hashes or full entity objects.

## Endpoint summary

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | 201, token and user |
| POST | `/auth/login` | Public | 200, token and user |
| GET | `/listings` | Public | 200, array of listings |
| GET | `/listings/{id}` | Public | 200, listing |
| POST | `/listings` | Logged in | 201, created listing |
| PUT | `/listings/{id}` | Owner; AVAILABLE | 200, updated listing |
| DELETE | `/listings/{id}` | Owner | 204, empty body |
| GET | `/me/listings` | Logged in | 200, own listings |
| PATCH | `/listings/{id}/collected` | Owner; RESERVED | 200, collected listing |
| POST | `/listings/{id}/requests` | Logged in; not owner | 201, request |
| GET | `/me/requests` | Logged in | 200, sent requests |
| GET | `/me/received-requests` | Logged in | 200, requests for own listings |
| PATCH | `/requests/{id}/status` | Listing owner | 200, updated request |

## Register

`POST /auth/register`

```json
{"name":"Suhaib","email":"suhaib@example.com","password":"MyCollegePass123"}
```

Name: required, up to 80 characters. Email: valid email, up to 160. Password: 8–72 characters and at most 72 UTF-8 bytes. The password above is a documentation example; choose your own.

Response shape (token abbreviated):

```json
{
  "token": "eyJ...",
  "user": {"id":1,"name":"Suhaib","email":"suhaib@example.com"}
}
```

Registration logs the user in immediately. A duplicate email returns 409, including concurrent registrations protected by the database unique constraint.

## Login

`POST /auth/login`

```json
{"email":"suhaib@example.com","password":"MyCollegePass123"}
```

Same response shape as register. Incorrect credentials return 401. Token lifetime: 24 hours. There is no refresh-token endpoint. Logout clears the browser session; the stateless token itself remains valid until expiry.

## Create or edit a listing

`POST /listings` or `PUT /listings/1`

```json
{
  "title": "Wooden study chair",
  "category": "Furniture",
  "condition": "Good",
  "description": "A sturdy chair with a few small scratches. Ready for pickup this weekend.",
  "pickupArea": "Hanamkonda, near university",
  "imageUrl": ""
}
```

Do not send `ownerId`, `owner`, `id` or `status`; these are controlled by the server. PUT replaces all editable fields. Limits: title 120, category 60, condition 60, description 2000, pickupArea 160, imageUrl 1000 characters. All fields except imageUrl are required and must not be blank. A nonempty image URL must be HTTP or HTTPS.

Response:

```json
{
  "id":1,
  "ownerId":1,
  "ownerName":"Suhaib",
  "title":"Wooden study chair",
  "category":"Furniture",
  "condition":"Good",
  "description":"A sturdy chair with a few small scratches. Ready for pickup this weekend.",
  "pickupArea":"Hanamkonda, near university",
  "imageUrl":"",
  "status":"AVAILABLE"
}
```

## Browse and search

```text
GET /listings
GET /listings?search=chair
GET /listings?category=Furniture&condition=Good&status=AVAILABLE
GET /listings?search=study&category=Furniture&status=AVAILABLE
```

Filters combine with AND. Search is case-insensitive title substring matching (SQL LIKE); `%` and `_` behave as SQL wildcard characters. Category and condition use case-insensitive exact matching. Omit or leave filters empty to include everything. Status must be `AVAILABLE`, `RESERVED` or `COLLECTED`. Results are newest first. A small college board returns a single array without pagination.

## Send a request

`POST /listings/1/requests`

```json
{"message":"I am a student and can pick this up on Saturday."}
```

Message is optional, maximum 500 characters. Send `{}` for no message. Response:

```json
{
  "id":1,
  "listingId":1,
  "listingTitle":"Wooden study chair",
  "listingStatus":"AVAILABLE",
  "requesterId":2,
  "requesterName":"Arjun",
  "message":"I am a student and can pick this up on Saturday.",
  "status":"PENDING"
}
```

The two `/me/...requests` routes return arrays of this same shape. Owner details and requester emails are not exposed by the request DTO. Messages can contain proposed pickup timing; this project has no chat or notification system.

## Decide a request

`PATCH /requests/1/status`

```json
{"status":"ACCEPTED"}
```

Or:

```json
{"status":"DECLINED"}
```

Only the listing owner can decide a pending request on an available listing. `PENDING` is not a valid decision. Acceptance atomically reserves the listing and declines other pending requests. Repeat decisions return 409. There is no cancellation or reopening flow.

## Mark collected / delete

`PATCH /listings/1/collected` — no body. Requires the owner and a RESERVED listing. Returns the updated listing with status COLLECTED.

`DELETE /listings/1` — no body. Requires the owner. Returns 204 with no JSON. Related requests are also deleted.

## Error format

```json
{"message":"Only the owner can modify this listing"}
```

| Status | Meaning |
| --- | --- |
| 400 | Invalid input, invalid enum/JSON, own-item request |
| 401 | Missing/expired/invalid authentication on a secured route, or incorrect login |
| 403 | Logged in but not the owner |
| 404 | Listing or request not found |
| 409 | Duplicate email/request, incompatible state, or competing database update |
| 500 | Unexpected server error; details are logged only on the backend |

An invalid token does not authenticate a user. Public listing GETs can still be read anonymously. UI route protection is for convenience; backend security is authoritative.
