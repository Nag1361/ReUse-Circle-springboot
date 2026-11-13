# Manual review checklist

These are steps for you to run after connecting your local MySQL database, not claims of completed testing. Use account A as owner, and B and C as requesters. Use separate browsers/private windows to keep sessions separate. For forbidden API checks, use Postman with the relevant user's Bearer token.

| # | Action | Expected result |
| --- | --- | --- |
| 1 | Browse while logged out | Listings and details load; personal pages redirect to login. |
| 2 | Register A with valid fields | 201, signed in; password is absent from JSON. |
| 3 | Register same email again, using different letter case | 409; no second account. |
| 4 | Submit invalid email or short/overlong password | Frontend/backend validation rejects it. |
| 5 | Log in with wrong password | 401 and useful error. |
| 6 | Create a listing without a token | 401. |
| 7 | Create listing as A; include B's ownerId in the JSON | Stored owner is A; status is AVAILABLE. |
| 8 | Create listing with missing title or invalid image URL | 400; no listing added. |
| 9 | Open listing with empty or broken image URL | Placeholder appears. |
| 10 | Search by title and combine category/condition/status filters | Matching cards only; Reset restores all. |
| 11 | A edits own AVAILABLE listing | Values persist after browser refresh and backend restart. |
| 12 | B attempts PUT/DELETE/collected on A's listing | 403; no change. |
| 13 | A requests own listing | 400. |
| 14 | B requests A's available listing with optional message | 201, PENDING; visible in B's sent and A's received views. |
| 15 | B repeats same request | 409; one database row only. |
| 16 | C sends request to same listing | A sees both pending requests. |
| 17 | B tries to accept a request on A's listing | 403. |
| 18 | A declines B's request | B sees DECLINED; listing remains AVAILABLE. |
| 19 | B tries requesting again after decline | 409; duplicates stay blocked. |
| 20 | On another listing with B/C pending, A accepts B | B becomes ACCEPTED; C becomes DECLINED; listing becomes RESERVED. |
| 21 | A repeats a decision or sends status PENDING | 409 for decided request; 400 for invalid decision PENDING. |
| 22 | B/C requests RESERVED or COLLECTED item | 409. |
| 23 | A tries to edit RESERVED or COLLECTED item | 409; edit link hidden. |
| 24 | A marks AVAILABLE listing collected | 409. |
| 25 | A marks RESERVED listing collected | Listing COLLECTED; accepted request remains ACCEPTED. |
| 26 | A marks COLLECTED listing collected again | 409. |
| 27 | A deletes own listing that has requests | Listing and its requests disappear; unrelated listings remain. |
| 28 | GET nonexistent listing, or decide nonexistent request with valid auth | 404. |
| 29 | Use invalid/expired JWT on a secured route | 401; frontend asks for login again. |
| 30 | Stop backend and submit/load a page | Clear connection error appears. |
| 31 | Use narrow/mobile viewport | Cards become one column; forms/navigation remain usable. |
| 32 | Two owner sessions accept different pending requests simultaneously | Exactly one succeeds; other returns 409. Only one ACCEPTED request and one RESERVED listing persist. |
| 33 | Request and accept concurrently | Listing row lock serializes actions; no new PENDING request is created after reservation. |
| 34 | Inspect users table | Password value is BCrypt hash, never raw password. |
| 35 | Restart backend and log in again | Listings/requests remain in MySQL. |

For concurrent acceptance, prepare two Postman tabs with the same owner's token and different pending request IDs, send both PATCH calls as close together as possible, then refresh received requests and inspect database rows. The row lock and transaction enforce the invariant even when HTTP calls overlap.
