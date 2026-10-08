# Gulavlival Grand --- Customer Website Development README

**Brand:** Gulavlival Grand\
**Tagline:** Stay • Dine • Experience\
**Project:** Customer Food Ordering Website\
**Document purpose:** Single source of truth for design, frontend,
backend integration, testing, and deployment of the customer website.

------------------------------------------------------------------------

## 1. Project Overview

The Customer Website is a simple, mobile-first food-ordering website for
Gulavlival Grand.

The customer should be able to:

1.  Open the website without logging in.
2.  Browse the restaurant menu.
3.  Open food details.
4.  Select quantity, size/variant, add-ons, and optional notes.
5.  Add items to the cart.
6.  Register or log in using the standard account system.
7.  Select dine-in, takeaway, or delivery.
8.  Enter the required order information.
9.  Place the order.
10. Receive an order number.
11. Track the order.
12. View previous/current orders in **My Orders**.

The website is intentionally customer-focused. Menu administration,
staff operations, kitchen management, team management, inventory,
accounting, and restaurant settings belong to the separate Staff /
Manager / Owner website.

The supplied customer planning document defines the customer journey as
browsing, login, ordering, and tracking, and states that menu, prices,
sold-out state, and restaurant open/closed state come from the shared
backend rather than being edited by customers.

------------------------------------------------------------------------

## 2. Important Decisions

  ---------------------------------------------------------------------
  Area                               Decision
  ---------------------------------- ----------------------------------
  Frontend                           Next.js + React + TypeScript +
                                     Tailwind CSS

  Backend                            FastAPI

  Database                           PostgreSQL

  Authentication                     Standard account login:
                                     email/mobile + password

  Password reset                     Secure reset flow

  Optional security                  OTP/MFA for verification or
                                     sensitive actions

  Payment                            Cash on Delivery / pay at
                                     restaurant according to current
                                     project scope

  Order types                        Dine-in, Takeaway, Delivery

  QR ordering                        Supported for table ordering

  Order status                       Received → Confirmed → Delivered

  Customer menu editing              Not allowed

  Staff/admin functions              Not part of customer website

  Backend source of truth            FastAPI + PostgreSQL

  Real-Time Menu Sync                WebSockets (/api/v1/ws/menu)
                                     Instant zero-refresh updates for
                                     prices, sold-out items, and photos

  Food Photo Storage                 Supabase Cloud Storage (menu-photos)
                                     with Next.js CDN image optimization

  Customer order history             Only the authenticated customer's
                                     orders

  Responsive target                  Mobile-first
  ---------------------------------------------------------------------

### Login decision

The latest project requirement is a **standard login system**.

Primary customer authentication:

``` text
Register
   ↓
Email/Mobile + Password
   ↓
Login
   ↓
Customer Session
```

OTP can remain an optional verification/MFA mechanism, but it is not the
only login method.

------------------------------------------------------------------------

# 3. Product Scope

## 3.1 In Scope

-   Public menu browsing
-   Real-time zero-refresh menu sync (WebSockets: live sold-out & prices)
-   High-resolution food photos served via Supabase CDN
-   Categories
-   Food cards
-   Food details
-   Variants/sizes
-   Add-ons
-   Quantity selection
-   Special instructions
-   Cart
-   Customer registration
-   Customer login
-   Forgot password
-   Reset password
-   Logout
-   Profile
-   Checkout
-   Dine-in
-   Takeaway
-   Delivery
-   Table QR ordering
-   Cash/pay-at-restaurant workflow
-   Order placement
-   Order confirmation
-   Order tracking
-   My Orders
-   Customer-side error/loading/empty states
-   Responsive UI
-   Accessibility
-   Secure API communication

## 3.2 Out of Scope

-   Staff dashboard
-   POS
-   Kitchen administration
-   Inventory
-   Payroll
-   Accounting
-   Hotel room management
-   Menu/price administration
-   Team management
-   Owner settings
-   Restaurant configuration
-   Online payment gateway unless added later

------------------------------------------------------------------------

# 4. Customer User Journey

``` text
                    ┌───────────────┐
                    │ Open Website  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Browse Menu   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Select Item   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Add to Cart   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Review Cart   │
                    └───────┬───────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Logged In?         │
                  └───────┬─────┬──────┘
                          │Yes  │No
                          │     ▼
                          │  ┌─────────────┐
                          │  │ Login/Register
                          │  └──────┬──────┘
                          │         │
                          └────┬────┘
                               ▼
                       ┌───────────────┐
                       │   Checkout    │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Place Order   │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Order Number  │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Track Order   │
                       └───────────────┘
```

------------------------------------------------------------------------

# 5. Required Development Diagrams

The following diagrams should be kept with the source
code/documentation. Mermaid is used so the diagrams can be
version-controlled and edited without design software.

------------------------------------------------------------------------

## 5.1 System Context Diagram

``` mermaid
flowchart LR
    C[Customer]
    WEB[Customer Website<br/>Next.js]
    API[FastAPI Backend]
    DB[(PostgreSQL)]
    STAFF[Staff / Manager / Owner Website]
    KITCHEN[Kitchen Screen / Printer]
    WA[WhatsApp / SMS Provider]

    C --> WEB
    WEB --> API
    API --> DB

    STAFF --> API
    API --> KITCHEN
    API --> WA

    API --> WEB
```

### Rule

The customer website does not maintain a separate menu/order database.

------------------------------------------------------------------------

# 6. Architecture Diagram

``` mermaid
flowchart TB
    subgraph Client["Customer Browser"]
        UI[Next.js + React + TypeScript]
        STATE[TanStack Query + Local UI State]
        FORMS[React Hook Form + Zod]
    end

    subgraph Backend["FastAPI Backend"]
        AUTH[Authentication]
        MENU[Menu Module]
        CART[Cart Module]
        ORDER[Order Module]
        CUSTOMER[Customer Module]
        TRACK[Order Tracking]
        SETTINGS[Read-only Restaurant Settings]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
    end

    UI --> STATE
    UI --> FORMS
    STATE --> AUTH
    STATE --> MENU
    STATE --> CART
    STATE --> ORDER
    STATE --> CUSTOMER
    STATE --> TRACK

    AUTH --> PG
    MENU --> PG
    CART --> PG
    ORDER --> PG
    CUSTOMER --> PG
    TRACK --> PG
    SETTINGS --> PG
```

------------------------------------------------------------------------

# 7. Use Case Diagram

``` mermaid
flowchart LR
    C((Customer))

    UC1([Browse Menu])
    UC2([Search / Filter Menu])
    UC3([View Item])
    UC4([Select Variant])
    UC5([Select Add-ons])
    UC6([Add to Cart])
    UC7([Register])
    UC8([Login])
    UC9([Reset Password])
    UC10([Manage Profile])
    UC11([Checkout])
    UC12([Place Order])
    UC13([View Order Status])
    UC14([View My Orders])
    UC15([Logout])

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5
    C --> UC6
    C --> UC7
    C --> UC8
    C --> UC9
    C --> UC10
    C --> UC11
    C --> UC12
    C --> UC13
    C --> UC14
    C --> UC15
```

------------------------------------------------------------------------

# 8. Customer Sitemap

``` mermaid
flowchart TD
    HOME["/"]
    MENU["/menu"]
    ITEM["/menu/[slug]"]
    CART["/cart"]
    LOGIN["/login"]
    REGISTER["/register"]
    FORGOT["/forgot-password"]
    RESET["/reset-password"]
    CHECKOUT["/checkout"]
    ORDERS["/orders"]
    ORDER["/orders/[id]"]
    PROFILE["/profile"]

    HOME --> MENU
    MENU --> ITEM
    ITEM --> CART
    MENU --> CART
    CART --> LOGIN
    CART --> CHECKOUT
    LOGIN --> CHECKOUT
    REGISTER --> CHECKOUT
    LOGIN --> ORDERS
    LOGIN --> PROFILE
    LOGIN --> FORGOT
    FORGOT --> RESET
    CHECKOUT --> ORDER
    ORDERS --> ORDER
```

------------------------------------------------------------------------

# 9. Order State Diagram

The customer-facing state model is intentionally simple.

``` mermaid
stateDiagram-v2
    [*] --> RECEIVED
    RECEIVED --> CONFIRMED
    RECEIVED --> CANCELLED
    CONFIRMED --> DELIVERED
    DELIVERED --> [*]
    CANCELLED --> [*]
```

### Meaning

-   **Received** --- customer successfully placed the order.
-   **Confirmed** --- restaurant accepted the order.
-   **Delivered** --- food was handed over/served/delivered.
-   **Cancelled** --- order was cancelled according to business rules.

Do not invent additional customer-facing statuses unless the backend
specification is updated.

------------------------------------------------------------------------

# 10. Order Placement Sequence Diagram

``` mermaid
sequenceDiagram
    actor Customer
    participant UI as Customer Website
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Staff as Staff Website

    Customer->>UI: Add food to cart
    UI->>API: Validate menu/cart
    API->>DB: Read current menu
    DB-->>API: Menu data
    API-->>UI: Validated cart

    Customer->>UI: Login/Register
    UI->>API: Authentication request
    API->>DB: Verify/create account
    DB-->>API: Account result
    API-->>UI: Secure session

    Customer->>UI: Place order
    UI->>API: POST /orders
    API->>DB: Validate availability and create order
    DB-->>API: Order created
    API-->>UI: Order number + Received

    Staff->>API: Get new orders
    API->>DB: Read pending orders
    DB-->>API: New order
    API-->>Staff: Order appears in inbox

    Staff->>API: Confirm order
    API->>DB: Update status
    API-->>UI: Status = Confirmed

    Staff->>API: Delivered
    API->>DB: Update status
    API-->>UI: Status = Delivered
```

------------------------------------------------------------------------

# 11. Authentication Flow

``` mermaid
sequenceDiagram
    actor Customer
    participant UI as Next.js
    participant API as FastAPI
    participant DB as PostgreSQL

    Customer->>UI: Register
    UI->>API: POST /auth/register
    API->>DB: Create user with password hash
    DB-->>API: User created
    API-->>UI: Authenticated session

    Customer->>UI: Login
    UI->>API: POST /auth/login
    API->>DB: Find user
    DB-->>API: Password hash
    API->>API: Verify password
    API-->>UI: Secure session

    Customer->>UI: Open My Orders
    UI->>API: GET /orders
    API->>DB: Query orders for authenticated user
    DB-->>API: Customer orders
    API-->>UI: Orders
```

------------------------------------------------------------------------

# 12. Database ER Diagram

``` mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string mobile UK
        string password_hash
        string name
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ADDRESSES {
        uuid id PK
        uuid user_id FK
        string label
        string address_line
        string city
        string state
        string postal_code
        boolean is_default
    }

    CATEGORIES {
        uuid id PK
        string name
        string slug UK
        boolean is_active
        int sort_order
    }

    MENU_ITEMS {
        uuid id PK
        uuid category_id FK
        string name
        string slug UK
        text description
        string image_url
        boolean is_available
        boolean is_active
    }

    MENU_VARIANTS {
        uuid id PK
        uuid menu_item_id FK
        string name
        decimal price
        boolean is_available
    }

    ADD_ONS {
        uuid id PK
        uuid menu_item_id FK
        string name
        decimal price
        boolean is_available
    }

    CARTS {
        uuid id PK
        uuid user_id FK
        string session_id
        string status
        datetime expires_at
    }

    CART_ITEMS {
        uuid id PK
        uuid cart_id FK
        uuid menu_item_id FK
        uuid variant_id FK
        int quantity
        decimal unit_price
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        string order_number UK
        string order_type
        string status
        string table_number
        text delivery_address
        decimal subtotal
        decimal tax
        decimal delivery_charge
        decimal total
        text special_instructions
        datetime created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        uuid variant_id FK
        string item_name_snapshot
        string variant_name_snapshot
        decimal unit_price
        int quantity
        decimal line_total
        text note
    }

    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        string old_status
        string new_status
        datetime created_at
    }

    USERS ||--o{ ADDRESSES : owns
    USERS ||--o{ CARTS : has
    USERS ||--o{ ORDERS : places
    CATEGORIES ||--o{ MENU_ITEMS : contains
    MENU_ITEMS ||--o{ MENU_VARIANTS : has
    MENU_ITEMS ||--o{ ADD_ONS : has
    CARTS ||--o{ CART_ITEMS : contains
    MENU_ITEMS ||--o{ CART_ITEMS : selected
    ORDERS ||--o{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : ordered
    ORDERS ||--o{ ORDER_STATUS_HISTORY : records
```

### Important database rule

Order items must store price/name snapshots.

Example:

``` text
Current menu price:
Cheese Pizza = ₹100

Old order:
Cheese Pizza = ₹90
```

Changing the menu price must not change historical orders.

------------------------------------------------------------------------

# 13. Frontend Component Architecture

``` mermaid
flowchart TD
    APP[App Layout]
    HEADER[Header]
    NAV[Category Navigation]
    MENU[Menu Grid]
    CARD[Food Card]
    DETAIL[Food Detail]
    CART[Cart]
    CHECKOUT[Checkout]
    AUTH[Auth Pages]
    ORDERS[My Orders]
    TRACK[Order Tracker]
    PROFILE[Profile]

    APP --> HEADER
    APP --> NAV
    APP --> MENU
    MENU --> CARD
    CARD --> DETAIL
    DETAIL --> CART
    CART --> CHECKOUT
    CHECKOUT --> AUTH
    APP --> ORDERS
    ORDERS --> TRACK
    APP --> PROFILE
```

------------------------------------------------------------------------

# 14. Suggested Next.js Project Structure

``` text
customer-web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── menu/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── cart/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (customer)/
│   │   ├── checkout/
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   └── profile/
│   │
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── layout/
│   ├── menu/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── orders/
│   ├── profile/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── menu/
│   ├── cart/
│   ├── checkout/
│   └── orders/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validators/
│   ├── utils/
│   └── constants/
│
├── hooks/
├── types/
├── store/
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

------------------------------------------------------------------------

# 15. Backend API Contract

The customer frontend should not directly access PostgreSQL.

All business operations go through FastAPI.

## Authentication

``` text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

## Menu

``` text
GET /api/v1/categories
GET /api/v1/menu
GET /api/v1/menu/{slug}
```

## Cart

``` text
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}
DELETE /api/v1/cart
```

## Orders

``` text
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/{id}
POST /api/v1/orders/{id}/cancel
```

## Customer

``` text
GET   /api/v1/customer/profile
PATCH /api/v1/customer/profile
GET   /api/v1/customer/addresses
POST  /api/v1/customer/addresses
PATCH /api/v1/customer/addresses/{id}
DELETE /api/v1/customer/addresses/{id}
```

These are a development starting point. Final endpoint names and
request/response schemas must be versioned and agreed before
implementation.

------------------------------------------------------------------------

# 16. API Rules

Every protected request should derive the customer identity from the
authenticated session/token.

Do not accept:

``` json
{
  "user_id": "someone-else"
}
```

as the source of authorization.

Instead:

``` text
Authenticated Session
        ↓
Backend identifies current user
        ↓
Query orders WHERE user_id = current_user.id
```

This prevents one customer from accessing another customer's orders.

------------------------------------------------------------------------

# 17. Checkout Validation

The backend must re-check all important data at checkout.

``` mermaid
flowchart TD
    A[Customer clicks Place Order]
    B{Authenticated?}
    C[Reject / Login]
    D{Restaurant Open?}
    E[Reject with Closed message]
    F{Items Available?}
    G[Reject unavailable item]
    H[Recalculate Prices]
    I[Validate Order Type]
    J[Validate Table / Address]
    K[Calculate Total]
    L[Create Order]
    M[Return Order Number]

    A --> B
    B -- No --> C
    B -- Yes --> D
    D -- No --> E
    D -- Yes --> F
    F -- No --> G
    F -- Yes --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
```

Never trust totals calculated only in the browser.

------------------------------------------------------------------------

# 18. Cart Rules

-   Cart may exist for guest users.
-   Guest cart can use a browser/session identifier.
-   Login should merge or preserve the cart according to the final
    product decision.
-   Backend validates item availability.
-   Backend calculates final prices.
-   Frontend displays server-calculated totals.
-   Quantity must have a reasonable maximum.
-   Invalid/deactivated items must be rejected at checkout.
-   Cart should handle expired/changed menu data gracefully.

------------------------------------------------------------------------

# 19. QR Table Ordering

Flow:

``` text
Table QR
   ↓
/menu?table=TABLE_CONTEXT
   ↓
Backend validates table context
   ↓
Customer browses
   ↓
Dine-in selected
   ↓
Table number prefilled
   ↓
Place Order
```

Do not trust a raw table number supplied by the browser without backend
validation.

------------------------------------------------------------------------

# 20. Security Requirements

## Authentication

-   Password hashing with a strong password hashing algorithm.
-   No plain-text passwords.
-   Secure session management.
-   HttpOnly cookies where applicable.
-   Secure and appropriate SameSite configuration.
-   Session expiration.
-   Refresh-token rotation if refresh tokens are used.
-   Logout/revocation support.
-   Password reset tokens must expire.
-   Password reset tokens must be single-use.
-   Rate-limit login and password reset endpoints.
-   Optional MFA/OTP for sensitive actions.

## Authorization

Customer permissions:

``` text
menu.read
cart.read
cart.write
order.create
order.read_own
order.cancel_own
profile.read_own
profile.update_own
address.read_own
address.write_own
```

Never expose staff/owner permissions to the customer frontend.

## API Security

-   Validate all request bodies with Pydantic.
-   Validate IDs and UUIDs.
-   Apply rate limiting to authentication.
-   Do not expose internal stack traces.
-   Use HTTPS in production.
-   Configure CORS only for trusted frontend origins.
-   Keep secrets in environment variables.
-   Log security events without storing passwords or sensitive tokens.

------------------------------------------------------------------------

# 21. Error Handling

Every major page needs:

### Loading state

``` text
Loading menu...
Loading order...
Checking account...
```

### Empty state

``` text
Your cart is empty.
No previous orders found.
No food available in this category.
```

### Error state

``` text
Something went wrong.
Please try again.
```

### Closed restaurant

``` text
Gulavlival Grand is currently closed.
Please check our opening hours.
```

### Sold-out item

``` text
Currently unavailable
```

### Authentication error

``` text
Invalid email/mobile or password.
```

Never reveal whether an account exists during password-reset requests in
a way that enables account enumeration.

------------------------------------------------------------------------

# 22. Accessibility

Target:

**WCAG 2.1 AA**

Requirements:

-   Keyboard navigation.
-   Visible focus states.
-   Semantic HTML.
-   Accessible labels.
-   Alt text for food images.
-   Sufficient text contrast.
-   Buttons large enough for touch.
-   Error messages associated with fields.
-   No information conveyed only by color.
-   Screen-reader-friendly status updates.
-   Responsive layout.

------------------------------------------------------------------------

# 23. Responsive Design

Primary target:

``` text
Mobile
  ↓
Tablet
  ↓
Desktop
```

Recommended breakpoints:

``` text
Mobile:  < 640px
Tablet:  640px–1023px
Desktop: >= 1024px
```

The menu and cart should be particularly easy to use on mobile.

------------------------------------------------------------------------

# 24. State Management

Use server state and UI state separately.

### TanStack Query

Use for:

-   Menu
-   Categories
-   Customer profile
-   Orders
-   Order tracking
-   Addresses

### Zustand or local state

Use for:

-   Cart UI
-   Temporary item selections
-   UI preferences
-   Mobile navigation state

Do not duplicate the entire backend database in Zustand.

------------------------------------------------------------------------

# 25. Data Fetching Strategy

``` text
Server Data
    ↓
TanStack Query
    ↓
React Components

Local UI State
    ↓
Zustand / useState
    ↓
Components
```

Use caching for menu data, but invalidate/refetch when staff changes
availability or prices.

------------------------------------------------------------------------

# 26. Order Tracking

Initial MVP can use polling.

Example:

``` text
GET /orders/{id}
every 5–10 seconds while order is active
```

Later, WebSockets/SSE can be introduced if real-time tracking is
required.

Do not add WebSockets unnecessarily in the first version.

------------------------------------------------------------------------

# 27. Performance Requirements

Target:

-   Fast first load on mobile.
-   Optimized food images.
-   Lazy-load images below the fold.
-   Avoid unnecessary JavaScript.
-   Cache public menu requests.
-   Use CDN/image optimization.
-   Paginate My Orders if history becomes large.
-   Avoid fetching full menu data repeatedly.
-   Debounce search input.
-   Use skeleton loading states.

------------------------------------------------------------------------

# 28. Testing Strategy

## Unit Tests

Test:

-   Price calculation
-   Quantity calculation
-   Cart totals
-   Tax calculation
-   Delivery charge
-   Order validation
-   Authentication validators
-   Password validation
-   Status transitions

## Integration Tests

Test:

-   Register
-   Login
-   Logout
-   Password reset
-   Menu API
-   Cart API
-   Checkout
-   Order creation
-   Customer order authorization

## E2E Tests

Main test:

``` text
Open website
→ Browse
→ Select item
→ Add to cart
→ Register
→ Login
→ Checkout
→ Place order
→ Receive order number
→ Open My Orders
→ View status
```

Another:

``` text
Customer A logs in
→ Customer A attempts Customer B order
→ Backend returns 403/404
```

------------------------------------------------------------------------

# 29. Critical Acceptance Tests

  Test                          Expected result
  ----------------------------- ---------------------------
  Browse without login          Works
  Register                      Account created
  Login                         Customer authenticated
  Wrong password                Request rejected
  Forgot password               Secure reset flow
  Sold-out item                 Cannot order
  Price changed                 New order uses new price
  Historical order              Keeps old price
  Customer A accesses B order   Blocked
  Closed restaurant             New ordering blocked
  QR table                      Correct table context
  Dine-in                       Table required
  Delivery                      Address required
  Takeaway                      Address not required
  Place order                   Order created
  Staff confirms                Customer sees Confirmed
  Staff delivers                Customer sees Delivered
  Logout                        Session invalidated/ended

------------------------------------------------------------------------

# 30. Git Workflow

Recommended:

``` text
main
  │
  ├── develop
  │
  ├── feature/customer-auth
  ├── feature/menu
  ├── feature/cart
  ├── feature/checkout
  ├── feature/orders
  └── fix/...
```

Commit format:

``` text
feat: add customer login
feat: add menu listing
feat: add cart management
feat: add checkout validation
feat: add order tracking
fix: prevent duplicate cart items
fix: protect customer order access
test: add checkout e2e tests
docs: update customer API
```

------------------------------------------------------------------------

# 31. Development Phases

## Phase 1 --- Project Setup

-   Create Next.js application.
-   Configure TypeScript.
-   Configure Tailwind.
-   Configure ESLint/Prettier.
-   Configure environment variables.
-   Configure API client.
-   Create layout.
-   Create design tokens.

## Phase 2 --- Public Menu

-   Home
-   Categories
-   Menu grid
-   Food card
-   Item details
-   Availability state
-   Responsive design

## Phase 3 --- Cart

-   Add item
-   Update quantity
-   Remove item
-   Variants
-   Add-ons
-   Notes
-   Cart totals

## Phase 4 --- Authentication

-   Register
-   Login
-   Logout
-   Forgot password
-   Reset password
-   Session persistence
-   Protected routes

## Phase 5 --- Checkout

-   Order type
-   Table context
-   Address
-   Special instructions
-   Cash/change field
-   Final total
-   Backend validation

## Phase 6 --- Orders

-   Create order
-   Confirmation
-   My Orders
-   Order details
-   Order tracking
-   Cancellation before Confirmed

## Phase 7 --- Integration

-   Connect staff order inbox.
-   Verify status updates.
-   Verify menu/price changes.
-   Verify sold-out synchronization.

## Phase 8 --- Testing

-   Unit tests
-   API integration tests
-   E2E tests
-   Security tests
-   Mobile testing
-   Accessibility testing

## Phase 9 --- Production

-   Build
-   Environment configuration
-   HTTPS
-   Domain
-   Monitoring
-   Backup
-   Error tracking
-   Production smoke tests

------------------------------------------------------------------------

# 32. Environment Variables

Example:

``` env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

NEXT_PUBLIC_APP_NAME=Gulavlival Grand

NEXT_PUBLIC_ENABLE_QR_ORDERING=true
NEXT_PUBLIC_ENABLE_DELIVERY=true
NEXT_PUBLIC_ENABLE_TAKEAWAY=true
NEXT_PUBLIC_ENABLE_DINE_IN=true
```

Never put private backend secrets into `NEXT_PUBLIC_*` variables.

------------------------------------------------------------------------

# 33. Definition of Done

A feature is complete only when:

-   UI is implemented.
-   Mobile responsive behavior works.
-   Loading state exists.
-   Error state exists.
-   Empty state exists where applicable.
-   API integration works.
-   Backend validation exists.
-   Authorization is enforced server-side.
-   Tests exist.
-   Accessibility is checked.
-   No console errors remain.
-   No hard-coded production data remains.
-   Documentation is updated.
-   Code is reviewed.
-   Feature works in production-like environment.

------------------------------------------------------------------------

# 34. Recommended Development Order

Do not build all pages simultaneously.

Recommended vertical slices:

``` text
Slice 1
Menu → Item → Cart

Slice 2
Register → Login → Logout

Slice 3
Cart → Checkout → Create Order

Slice 4
My Orders → Order Details → Tracking

Slice 5
QR Dine-in

Slice 6
Delivery / Takeaway refinements

Slice 7
Performance + Accessibility + Security

Slice 8
Production deployment
```

This keeps each feature testable before moving to the next.

------------------------------------------------------------------------

# 35. Customer Website API Dependency Map

``` mermaid
flowchart LR
    MENU_UI[Menu UI] --> MENU_API[GET Menu]
    ITEM_UI[Item UI] --> ITEM_API[GET Item]
    CART_UI[Cart UI] --> CART_API[Cart APIs]
    AUTH_UI[Login/Register] --> AUTH_API[Auth APIs]
    CHECKOUT_UI[Checkout] --> ORDER_API[Create Order]
    ORDERS_UI[My Orders] --> ORDERS_API[Customer Orders]
    TRACK_UI[Tracking] --> ORDER_DETAIL[Order Detail]

    MENU_API --> BACKEND[FastAPI]
    ITEM_API --> BACKEND
    CART_API --> BACKEND
    AUTH_API --> BACKEND
    ORDER_API --> BACKEND
    ORDERS_API --> BACKEND
    ORDER_DETAIL --> BACKEND
```

------------------------------------------------------------------------

# 36. Final Architecture Rule

The most important development rule is:

``` text
Frontend = Customer Experience
Backend = Business Rules
PostgreSQL = Source of Truth
```

The frontend must never be trusted for:

-   Final price
-   Availability
-   Customer identity
-   Order ownership
-   Tax calculation
-   Delivery eligibility
-   Table validity
-   Order status transitions

The backend validates these values again.

------------------------------------------------------------------------

# 37. Relationship With Staff Website

``` mermaid
flowchart LR
    CUSTOMER[Customer Website]
    API[Shared FastAPI Backend]
    DB[(Shared PostgreSQL)]
    STAFF[Staff / Manager / Owner Website]

    CUSTOMER --> API
    STAFF --> API
    API --> DB

    DB --> API
    API --> CUSTOMER
    API --> STAFF
```

Example:

``` text
Customer changes nothing manually
        ↓
Customer places Cheese Pizza order
        ↓
FastAPI validates order
        ↓
PostgreSQL creates ORDER
        ↓
Staff sees order
        ↓
Staff confirms
        ↓
Customer sees Confirmed
        ↓
Staff delivers
        ↓
Customer sees Delivered
```

------------------------------------------------------------------------

# 38. Final Build Checklist

### Product

-   [ ] Customer menu
-   [ ] Item details
-   [ ] Cart
-   [ ] Registration
-   [ ] Login
-   [ ] Forgot password
-   [ ] Profile
-   [ ] Checkout
-   [ ] Dine-in
-   [ ] Takeaway
-   [ ] Delivery
-   [ ] QR ordering
-   [ ] Order confirmation
-   [ ] My Orders
-   [ ] Tracking

### Backend

-   [ ] Auth API
-   [ ] Menu API
-   [ ] Cart API
-   [ ] Customer API
-   [ ] Order API
-   [ ] Authorization
-   [ ] Validation
-   [ ] Order ownership
-   [ ] Price snapshot
-   [ ] Status transitions

### Security

-   [ ] Password hashing
-   [ ] Secure sessions
-   [ ] Rate limiting
-   [ ] CORS
-   [ ] HTTPS
-   [ ] Password reset protection
-   [ ] Authorization tests
-   [ ] Audit/security logs

### Quality

-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] E2E tests
-   [ ] Mobile testing
-   [ ] Accessibility
-   [ ] Performance
-   [ ] Error states
-   [ ] Empty states
-   [ ] Production smoke test

------------------------------------------------------------------------

# 39. Final Customer Experience

The final experience should remain simple:

``` text
CUSTOMER

Browse
  ↓
Choose Food
  ↓
Add to Cart
  ↓
Login / Register
  ↓
Checkout
  ↓
Place Order
  ↓
Order Number
  ↓
Track
  ↓
Delivered
```

The customer website should not feel like a restaurant management
system. Its purpose is simply:

**Browse → Order → Track.**
