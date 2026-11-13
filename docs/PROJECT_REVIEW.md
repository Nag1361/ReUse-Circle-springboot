# Explain the project in a review

## What it does

“ReUseCircle lets community members give usable items away for free. Visitors browse and search. Registered users create listings and send requests. The owner chooses a requester, which reserves the item. After pickup, the owner marks it collected.”

## One request through the code

1. A React page calls the `api()` helper, which uses native fetch and attaches the JWT.
2. `JwtFilter` verifies the token and puts the user's database ID into Spring Security's authentication context.
3. A controller receives the JSON DTO and authenticated ID. Bean Validation checks required fields and lengths.
4. The service checks ownership and business rules.
5. A repository reads or writes MySQL through Spring Data JPA.
6. The service returns a response DTO, which Spring turns into JSON for React.

## Why only three entities?

- `User` stores account details and the password hash.
- `Listing` belongs to one User via `owner_id`.
- `ItemRequest` belongs to one Listing and one requesting User.

Many listings can belong to one owner, and many requests can belong to one listing or requester, so these are `ManyToOne` relationships. They are unidirectional: User does not need a collection of every listing/request. Queries retrieve those when needed.

`condition` maps to the SQL column `item_condition` to avoid SQL keyword issues. Relationships use foreign keys. The unique pair `(listing_id, requester_id)` prevents duplicate requests at the database level.

## How authentication works

Registration hashes the password with BCrypt. Login checks the submitted password against that hash and returns a JWT. JJWT handles signing, verification and expiry. On later requests the frontend sends `Authorization: Bearer ...`. Spring Security requires authentication for protected routes. Each service checks ownership again before a change. Token subject is a stable user ID; no client-supplied owner ID is trusted.

The browser stores this simple project's token in sessionStorage. Closing the tab ends its local session; logout clears it. This is a basic college-project approach, not token revocation or refresh-token infrastructure. Protecting the backend does not depend on React hiding a button.

## Why DTOs?

Input DTOs allow only editable data. Output DTOs return just the fields the page needs. Entities and password hashes never go directly into API responses. Lombok generates routine getters, setters and constructors; it does not implement business logic.

## Why services and transactions?

Controllers route requests; services enforce rules; repositories handle persistence. `@Transactional` keeps several database changes together: either they all commit or they roll back.

When accepting an item request, the service locks the listing row (`PESSIMISTIC_WRITE`). It checks that the listing is still AVAILABLE and the request is still PENDING, accepts it, sets the listing to RESERVED and declines competing requests. The lock is held until commit. Other operations for that listing wait for the same lock and recheck its current status. The request is also loaded with a locking read after acquiring the listing lock to avoid an old request snapshot. This is the only extra database coordination needed to prevent two winners.

JPA tracks changes to entities loaded inside a transaction; setters are written at commit even when `save()` is not called again. Read-only service transactions also let lazy owner/listing fields be accessed safely while mapping DTOs, with `open-in-view=false`.

## Frontend organization

`App.jsx` holds the small authentication state and routes. Each page uses `useState` and `useEffect`. No Redux, context framework or global state library is needed. The shared `api.js` keeps the base URL and token handling in one place. Login and Register share a form component; sent/received requests share one page component. CSS supplies the responsive layout and image placeholder.

## Scope

There are no moderators, reports, payments, chat, notifications, upload processing, OAuth2, cancellation or reopening features. Pickup timing can be proposed in the request message. This keeps the implementation focused on the required college-project flow.
