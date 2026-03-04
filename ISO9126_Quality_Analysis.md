# ISO 9126 Quality Model Application — FoodVerse

---

## 1. Brief Introduction of Project

**FoodVerse** is a full-stack, multi-role food delivery web application designed to connect customers, restaurant/shop owners, and delivery personnel on a single platform. Built with **React 19 (Vite)**, **Node.js/Express**, **MongoDB**, and **Socket.io**, it supports the entire food ordering lifecycle — from discovery to doorstep delivery.

### Core Actor Roles
| Role | Responsibilities |
|---|---|
| **Customer** | Browse shops, add items to cart, place orders, pay, track delivery, rate items |
| **Shop Owner** | Manage shop & menu, handle incoming orders, assign delivery boys |
| **Delivery Boy** | Accept delivery tasks, share live location, confirm delivery via OTP |

### Key Technical Capabilities
- **JWT + Firebase** authentication with role-based protected routes
- **Stripe** online payments alongside Cash-on-Delivery (COD)
- **Socket.io** for real-time order status updates and live delivery tracking
- **Leaflet/React-Leaflet** maps with geospatial MongoDB queries for proximity search
- **AI-powered recommendation engine** using Jaccard similarity, recency weighting, dietary preferences, and allergen filtering
- **Cloudinary** for image hosting; **Nodemailer** for transactional emails
- **Redux Toolkit** for centralized client state management
- **Tailwind CSS + Framer Motion** for responsive, animated UI

---

## 2. Requirement → Quality Factor Mapping Table

| # | Project Requirement / Feature | ISO 9126 Characteristic | ISO 9126 Sub-Characteristic | Justification |
|---|---|---|---|---|
| R01 | User Sign-Up / Sign-In / Forgot Password | Functionality | Suitability | Core capability required for any role to access the platform |
| R02 | JWT token verification middleware (`isAuth.js`) | Functionality | Security | Every protected API route validates a signed JWT; unauthorized access is blocked |
| R03 | Firebase OAuth integration | Functionality | Security | Delegates authentication to a trusted identity provider, reducing credential exposure |
| R04 | Role-based protected routes (customer / owner / delivery boy) | Functionality | Security | Ensures users can only access screens and APIs matching their role |
| R05 | Location-based shop & delivery boy discovery (geospatial MongoDB queries) | Functionality | Suitability | Returns only shops/delivery boys near the customer's coordinates, fulfilling a core business need |
| R06 | Shopping cart with item add / remove / quantity management | Functionality | Suitability | Provides the primary transaction-building workflow for customers |
| R07 | Stripe payment integration + COD option | Functionality | Suitability | Fulfils two distinct payment use-cases; cart total is computed and charged accurately |
| R08 | Stripe amount accuracy (price × quantity calculation) | Functionality | Accuracy | Monetary computations must be correct; sub-total, tax, and final charge must match |
| R09 | RESTful API exposed over HTTP/HTTPS (CORS-configured) | Functionality | Interoperability | The backend can be consumed by any client (web, mobile) that speaks HTTP; CORS headers control safe cross-origin access |
| R10 | Socket.io real-time order status notifications | Functionality | Suitability | Customers and owners receive instant updates without polling |
| R11 | OTP-based delivery confirmation | Functionality | Security | A time-limited OTP (`deliveryOtp`, `otpExpires`) prevents false delivery confirmations |
| R12 | Item ratings & reviews system | Functionality | Suitability | Enables community-driven quality signals for shop items |
| R13 | AI recommendation engine (Jaccard similarity, recency decay, dietary/allergen filter) | Functionality | Accuracy | Personalised suggestions are computed from actual user behaviour and preferences, requiring algorithmic correctness |
| R14 | Email notifications via Nodemailer | Functionality | Suitability | Transactional emails (order confirmation, OTP) are part of the defined feature set |
| R15 | MongoDB with Mongoose schema validation | Reliability | Maturity | Well-established ODM with schema-level data validation prevents corrupt documents from persisting |
| R16 | Enum-constrained order status field (`pending → preparing → out of delivery → delivered`) | Reliability | Fault Tolerance | Invalid status transitions are rejected at the database schema level |
| R17 | HTTP error handling & fallback JSON responses across all controllers | Reliability | Fault Tolerance | Controllers wrap logic in try/catch and return structured error responses instead of crashing |
| R18 | OTP expiry check (`otpExpires`) before delivery confirmation | Reliability | Recoverability | Expired OTPs are invalidated; a new one can be requested, allowing recovery from missed deliveries |
| R19 | Payment status tracking (`pending / paid / failed`) with `paidAt` and `transactionId` | Reliability | Recoverability | Failed payments can be identified and retried; transaction IDs allow reconciliation |
| R20 | Intuitive Landing Page with role explanation and call-to-action | Usability | Understandability | New visitors immediately understand the platform's purpose without reading documentation |
| R21 | Tailwind CSS responsive design (mobile-first breakpoints) | Usability | Operability | The UI adapts to any screen size, making the app operable on phones, tablets, and desktops |
| R22 | Framer Motion animations and visual feedback | Usability | Attractiveness | Smooth transitions, hover effects, and animated components improve perceived quality |
| R23 | Dietary preferences form (`DietaryPreferences.jsx`) with guided onboarding | Usability | Learnability | Users are guided through a one-time preference setup, reducing the learning curve for personalisation features |
| R24 | Redux-persisted cart (localStorage sync via `loadCartFromStorage`) | Usability | Operability | Cart survives page refresh without requiring re-login or re-addition of items |
| R25 | Socket.io real-time location push (sub-second updates on map) | Efficiency | Time Behaviour | Live delivery map updates rely on low-latency socket events rather than periodic HTTP polling |
| R26 | Geospatial `$nearSphere` / `$geoWithin` MongoDB queries with 2dsphere index | Efficiency | Resource Utilization | Indexed geospatial queries avoid full-collection scans when finding nearby shops or delivery boys |
| R27 | Vite build tool (ESBuild bundler, tree-shaking, code splitting) | Efficiency | Time Behaviour | Production bundles are minimal and fast to load, reducing Time-to-Interactive for end users |
| R28 | Cloudinary CDN for images (upload once, serve globally) | Efficiency | Resource Utilization | Offloads image storage and serving from the application server; CDN caching reduces bandwidth |
| R29 | Modular MVC architecture (routes / controllers / models / utils separated) | Maintainability | Analyzability | Any developer can locate and diagnose a bug by following the route → controller → model path |
| R30 | Separate utility modules (`stripe.js`, `cloudinary.js`, `mail.js`, `token.js`) | Maintainability | Changeability | Third-party integrations are isolated; swapping a provider requires changing only one utility file |
| R31 | Redux slices (`userSlice`, `ownerSlice`, `mapSlice`) encapsulating state logic | Maintainability | Changeability | UI state updates are localised to slices; adding or modifying a feature does not ripple across the codebase |
| R32 | Custom React hooks (`useGetCurrentUser`, `useSocket`, `useUpdateLocation`, etc.) | Maintainability | Stability | Shared logic lives in hooks; a bug fix or enhancement propagates automatically to all consuming components |
| R33 | Environment variable configuration (`.env`) for all secrets and URLs | Maintainability | Testability | Developers can point the app at a test database/server without changing source code |
| R34 | Deployment on Vercel (frontend) and Render (backend) via config files | Portability | Installability | `vercel.json` and platform-detected build scripts allow zero-config cloud deployment |
| R35 | CORS allow-list supporting `localhost` and production domain simultaneously | Portability | Co-existence | The same backend serves both local development and the live Vercel deployment without conflict |
| R36 | Configurable `serverUrl` constant in `App.jsx` (switch between local/production) | Portability | Replaceability | A single constant change redirects all API calls, enabling the frontend to target a replacement backend |
| R37 | React + Node.js stack (platform-agnostic, runs on Windows/Linux/macOS) | Portability | Adaptability | The application has no OS-specific dependencies; it can be hosted on any POSIX or Windows environment |

---

## 3. Brief Explanation of Each Quality Characteristic

### 3.1 Functionality

Functionality measures whether the system provides the **right set of features** that meet stated and implied needs.

- **Suitability** is the most heavily mapped characteristic in FoodVerse because the application must serve three distinct user roles — each with their own workflows (ordering, managing, delivering). Features such as location-based discovery (R05), the shopping cart (R06), real-time notifications (R10), rating system (R12), and email alerts (R14) are each purpose-built to satisfy a specific user need.
- **Accuracy** is critical for two features: (a) payment calculation (R08) — a wrong subtotal directly causes financial harm; and (b) the recommendation engine (R13) — inaccurate suggestions reduce user trust and engagement.
- **Security** spans authentication (R02, R03), role-based access control (R04), and delivery OTP verification (R11). Since the system handles real money (Stripe) and physical locations, security sub-characteristics are non-negotiable.
- **Interoperability** is satisfied by the standard RESTful API design (R09), allowing the backend to be consumed by a future mobile app or third-party integrations without modification.

---

### 3.2 Reliability

Reliability measures how well the system maintains its performance level under stated conditions and recovers from failures.

- **Maturity** is addressed through Mongoose schema validation (R15). By defining strict schemas with enums, required fields, and type checks, the database layer rejects malformed data before it enters the system — a hallmark of a mature data persistence strategy.
- **Fault Tolerance** is demonstrated through server-side try/catch error handling (R17) and order status enums (R16). The system continues to function and return meaningful error messages even when unexpected inputs or transient failures occur.
- **Recoverability** directly applies to two workflows: OTP expiry (R18) allows re-requesting a delivery code after a timeout, and payment status tracking (R19) supports payment retry and financial reconciliation — both enabling the system to recover gracefully from partial failures.

---

### 3.3 Usability

Usability measures how easy and pleasant the system is to learn and use.

- **Understandability** is served by the Landing Page (R20), which communicates the platform's value proposition and three user roles before requiring a sign-up — reducing cognitive friction for first-time visitors.
- **Operability** is ensured by the responsive Tailwind CSS layout (R21) and persisted Redux cart (R24). The app works across device sizes, and users do not lose their cart due to accidental page navigation.
- **Attractiveness** is a differentiator achieved through Framer Motion animations (R22). Animated transitions, loading states, and interactive components make the interface engaging and professionally polished.
- **Learnability** is served by the dietary preference guided setup (R23), which progressively discloses personalisation options — new users are not overwhelmed, while returning users benefit from smart recommendations.

---

### 3.4 Efficiency

Efficiency measures the relationship between the system's performance and the resources used.

- **Time Behaviour** is addressed at two layers: Socket.io (R25) provides near-real-time delivery map updates without costly polling intervals; and Vite's ESBuild bundler (R27) ensures the initial page load is fast by shipping only what the browser needs.
- **Resource Utilization** is optimised through MongoDB geospatial indexes (R26) — which prevent expensive full-collection scans when finding nearby entities — and Cloudinary CDN (R28) which offloads binary asset serving entirely, conserving server CPU and bandwidth.

---

### 3.5 Maintainability

Maintainability measures how easily the system can be modified to fix defects, improve performance, or adapt to a changed environment.

- **Analyzability** is supported by the strict MVC folder structure (R29). Routes, business logic, and data models are physically separated, so a developer following a bug report can trace the path from HTTP endpoint → controller function → database model without guessing.
- **Changeability** is enabled by isolated utility modules (R30) and Redux slices (R31). Because Stripe, Cloudinary, and email logic are each in their own file, replacing any third-party service is a local change. Redux slices ensure that adding a new feature does not inadvertently alter unrelated state.
- **Stability** is promoted through custom hooks (R32). Shared logic such as socket connection management, location updates, and user data fetching resides in hooks — a change in one hook is automatically reflected everywhere it is used, with minimal risk of regression.
- **Testability** is facilitated by environment variable configuration (R33). Test environments can be set up by simply providing a `.env.test` file, permitting isolated unit and integration testing without touching production configuration.

---

### 3.6 Portability

Portability measures how easily the system can be transferred from one environment to another.

- **Adaptability** is demonstrated by the cross-platform Node.js/React technology choice (R37). FoodVerse makes no use of OS-specific APIs; the backend runs on Linux (Render), Windows (development), or macOS without modification.
- **Co-existence** is addressed by the CORS allow-list (R35), which lists both `localhost` and the production Vercel domain. Multiple environments share the same backend instance without conflict.
- **Replaceability** is enabled by the single `serverUrl` export in `App.jsx` (R36). Every Axios call in the frontend — including calls to the AI-powered recommendation engine (`/api/recommendations`), which is one of FoodVerse's most distinctive features — uses this constant; pointing the entire frontend to a replacement or upgraded backend (e.g., a more advanced recommendation service) is a one-line change, without touching any component or hook.
- **Installability** is addressed by `vercel.json` and platform-detected build scripts (R34). Cloud providers can deploy the application without manual server configuration.

---

## 4. Summary Matrix

```
┌──────────────────────┬──────────────────────────────────────────────────────────────┐
│ ISO 9126             │ FoodVerse Features Mapped                                    │
│ Characteristic       │                                                              │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Functionality        │ Auth, Cart, Payments, Orders, OTP, Ratings,                  │
│  ├ Suitability       │ Notifications, Real-time tracking, Recommendations, Email    │
│  ├ Accuracy          │ Stripe price calculation, Recommendation algorithm           │
│  ├ Security          │ JWT middleware, Firebase OAuth, Role-based routes, OTP       │
│  └ Interoperability  │ RESTful API, CORS headers                                    │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Reliability          │                                                              │
│  ├ Maturity          │ Mongoose schema validation, enum constraints                 │
│  ├ Fault Tolerance   │ Try/catch error handling, status enums                       │
│  └ Recoverability    │ OTP expiry + retry, payment status tracking                  │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Usability            │                                                              │
│  ├ Understandability │ Landing page with role explanation                           │
│  ├ Learnability      │ Dietary preference guided onboarding                         │
│  ├ Attractiveness    │ Framer Motion animations, Tailwind themes                    │
│  └ Operability       │ Responsive layout, persisted cart                            │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Efficiency           │                                                              │
│  ├ Time Behaviour    │ Socket.io real-time events, Vite optimised build             │
│  └ Resource Util.    │ Geospatial MongoDB indexes, Cloudinary CDN                   │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Maintainability      │                                                              │
│  ├ Analyzability     │ MVC folder structure                                         │
│  ├ Changeability     │ Isolated utility modules, Redux slices                       │
│  ├ Stability         │ Custom React hooks for shared logic                          │
│  └ Testability       │ .env configuration for environment switching                 │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ Portability          │                                                              │
│  ├ Adaptability      │ Cross-platform Node.js/React stack                           │
│  ├ Co-existence      │ CORS allow-list (dev + production)                           │
│  ├ Replaceability    │ Single serverUrl constant                                    │
│  └ Installability    │ vercel.json, platform-detected CI/CD build                   │
└──────────────────────┴──────────────────────────────────────────────────────────────┘
```
