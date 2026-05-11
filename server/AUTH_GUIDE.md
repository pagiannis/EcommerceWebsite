# Authentication & Session Guide

## Τι υλοποιήθηκε

Το σύστημα χρησιμοποιεί **Spring Security** για authentication/authorization και **Spring Session JDBC** για αποθήκευση sessions στη βάση δεδομένων.

---

## Αρχεία που άλλαξαν / δημιουργήθηκαν

| Αρχείο | Τι κάνει |
|--------|----------|
| `config/SecurityConfig.java` | Κεντρική ρύθμιση Security — endpoints, BCrypt, CORS, rate limit filter |
| `service/UserService.java` | Υλοποιεί `UserDetailsService` (φορτώνει user από βάση) + BCrypt hashing |
| `controller/UserController.java` | Login/logout endpoints με session management & session rotation |
| `security/AuthRateLimitFilter.java` | Per-IP rate limiting για login & register |
| `config/DataInitializer.java` | Test users δημιουργούνται με hashed password |
| `resources/application.properties` | JDBC session store + cookie hardening |

---

## Πώς λειτουργεί το Session (βήμα-βήμα)

### 1. Login

```
POST /api/users/login
Body: { "email": "user@example.com", "password": "mypassword" }
```

**Τι γίνεται στον server:**

```
1. AuthRateLimitFilter ελέγχει το per-IP bucket — αν εξαντληθεί → 429
       ↓
2. AuthenticationManager.authenticate()
       ↓
3. UserService.loadUserByUsername(email)
       ↓  φορτώνει User από βάση
4. BCrypt.matches(rawPassword, storedHash)
       ↓  αν δεν ταιριάζει → 401 Unauthorized
5. Session rotation: αν υπάρχει παλιό session, invalidate
       ↓
6. Δημιουργία SecurityContext με το Authentication object
       ↓
7. Αποθήκευση SecurityContext στο HTTP Session
       ↓
8. Spring Session JDBC αποθηκεύει το session στη βάση (πίνακας SPRING_SESSION)
       ↓
9. Server επιστρέφει cookie: SESSION=<uuid>  +  UserResponse JSON
```

**Response headers:**
```
Set-Cookie: SESSION=abc123xyz; Path=/; HttpOnly; SameSite=Strict
```

---

### 2. Authenticated Request

```
GET /api/cart
Cookie: SESSION=abc123xyz   ← browser το στέλνει αυτόματα
```

**Τι γίνεται στον server:**

```
1. Spring Session αναγνωρίζει το SESSION cookie
       ↓
2. Κάνει lookup στη βάση: SELECT * FROM SPRING_SESSION WHERE SESSION_ID = 'abc123xyz'
       ↓
3. Φορτώνει το SecurityContext από το session
       ↓
4. Spring Security ελέγχει αν το endpoint απαιτεί auth → ΝΑΙ
       ↓
5. Βρίσκει authenticated user → επιτρέπει το request
       ↓
6. Controller εκτελείται κανονικά
```

---

### 3. Unauthenticated Request σε protected endpoint

```
GET /api/cart
(χωρίς cookie)
```

**Response:**
```
HTTP 401 Unauthorized
```

---

### 4. Logout

```
POST /api/users/logout
Cookie: SESSION=abc123xyz
```

**Τι γίνεται:**
```
1. session.invalidate() → διαγράφει το session από τη βάση
2. SecurityContextHolder.clearContext() → καθαρίζει την μνήμη
3. Browser λαμβάνει 204 No Content
4. Το SESSION cookie γίνεται άκυρο
```

---

## Πίνακες βάσης για Sessions

Το schema δημιουργείται μία φορά μέσω `spring.sql.init.mode=always` (το `spring.session.data.jdbc.initialize-schema=never` αποτρέπει το Spring Session να ξανατρέξει το script σε κάθε boot):

```sql
SPRING_SESSION
├── PRIMARY_ID       -- UUID του session
├── SESSION_ID       -- το ID που πηγαίνει στο cookie
├── CREATION_TIME    -- πότε δημιουργήθηκε
├── LAST_ACCESS_TIME -- τελευταία χρήση
├── MAX_INACTIVE_INTERVAL -- timeout σε δευτερόλεπτα (24h = 86400)
└── PRINCIPAL_NAME   -- το email του logged-in user

SPRING_SESSION_ATTRIBUTES
├── SESSION_PRIMARY_ID  -- FK στο SPRING_SESSION
├── ATTRIBUTE_NAME      -- π.χ. "SPRING_SECURITY_CONTEXT"
└── ATTRIBUTE_BYTES     -- serialized SecurityContext
```

---

## Authorization Rules

### Επίπεδο 1 — SecurityConfig (ποιος μπορεί να φτάσει στο endpoint)

```
Public (δεν απαιτεί login):
  POST  /api/users/login
  POST  /api/users/register
  POST  /api/users/logout
  GET   /api/products/**
  GET   /api/categories/**
  GET   /api/reviews/**
  GET   /api/app-reviews/**

Login required:
  οτιδήποτε άλλο (anyRequest().authenticated())

Admin only:
  /api/admin/**
```

### Επίπεδο 2 — Ownership checks (ποιος μπορεί να αγγίξει τι)

Πέρα από το αν ο user είναι logged in, υπάρχει δεύτερος έλεγχος που εξασφαλίζει ότι ο user αγγίζει **μόνο τα δικά του δεδομένα**:

| Endpoint | Έλεγχος | Πού γίνεται |
|---|---|---|
| `GET/PUT/DELETE /api/users/{id}` | `id` == logged-in user | `UserService.requireSelf()` |
| `GET/POST /api/cart/{userId}` | `userId` == logged-in user | `UserService.requireSelf()` |
| `PUT/DELETE /api/cart/{cartItemId}` | cartItem ανήκει στον logged-in user | `CartService.requireCartItemOwner()` |
| `GET/POST /api/orders/user/{userId}/**` | `userId` == logged-in user | `UserService.requireSelf()` |
| `GET /api/orders/{orderId}` | order ανήκει στον logged-in user | `OrderService.requireOrderOwner()` |
| `POST /api/orders/{orderId}/reorder` | `userId` param == logged-in user | `UserService.requireSelf()` |
| `DELETE /api/reviews/{reviewId}` | review ανήκει στον logged-in user | `ReviewService.deleteReview` (έλεγχος email) |
| `* /api/users/{userId}/wishlist/**` | `userId` == logged-in user | `UserService.requireSelf()` |
| `* /api/users/{userId}/addresses` (GET/POST) | `userId` == logged-in user | `UserService.requireSelf()` |
| `PUT/DELETE/PATCH /api/users/{userId}/addresses/{addressId}` | `userId` == logged-in user **και** address ανήκει σε αυτόν | `UserService.requireSelf()` + `AddressService.requireAddressOwner()` |
| `* /api/admin/**` | ROLE_ADMIN | SecurityConfig |

Αν ο έλεγχος αποτύχει → `403 Forbidden`.

Για να προσθέσεις νέο protected endpoint, δεν χρειάζεται να αλλάξεις το `SecurityConfig` — το `anyRequest().authenticated()` το καλύπτει αυτόματα. Αν χρειάζεται ownership check, πρόσθεσε `userService.requireSelf()` στον controller ή αντίστοιχη μέθοδο στο service.

---

## Password Hashing (BCrypt)

Πριν: `passwordHash = "mypassword"` (plain text — επικίνδυνο)

Τώρα:
```
"mypassword"  →  BCrypt  →  "$2a$10$xK8L3mN..."  (αποθηκεύεται στη βάση)
```

Το BCrypt είναι **one-way** — δεν μπορεί να αποκρυπτογραφηθεί. Κατά το login, το Spring Security τρέχει `BCrypt.matches(rawPassword, storedHash)` και συγκρίνει αποτελέσματα χωρίς να αποκρυπτογραφεί.

**Password policy:** ελάχιστο μήκος **8 χαρακτήρες** (`UserRequest`, `UserRegistrationRequest`).

---

## Hardening

### Cookie attributes (`application.properties`)

```properties
server.servlet.session.cookie.same-site=strict
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
```

| Attribute | Τι κάνει |
|---|---|
| `SameSite=Strict` | Browser στέλνει το cookie μόνο σε same-site requests → CSRF protection |
| `HttpOnly=true` | Το JavaScript (`document.cookie`) δεν μπορεί να διαβάσει το cookie → προστασία από session theft μέσω XSS |
| `Secure=false` (dev) / `true` (prod) | Σε prod με HTTPS, γύρισέ το `true` ώστε το cookie να μη στέλνεται ποτέ σε plain HTTP |

### Session fixation protection

Στο `UserController.login`, πριν δημιουργηθεί νέο session, ακυρώνεται το προηγούμενο. Έτσι ο authenticated user παίρνει νέο session ID και ένας attacker που ίσως είχε προ-θέσει γνωστό session ID στο θύμα δεν μπορεί να μοιραστεί το authenticated session.

### Rate limiting (`AuthRateLimitFilter`)

Per-IP buckets με Bucket4j, runs **πριν** το authentication ώστε flooded requests να μη φτάνουν στο BCrypt comparison.

| Endpoint | Όριο |
|---|---|
| `POST /api/users/login` | 10 αιτήματα / λεπτό ανά IP |
| `POST /api/users/register` | 5 αιτήματα / ώρα ανά IP |

Αν ξεπεραστεί → `429 Too Many Requests` με JSON body. Σε production behind proxy, ο filter διαβάζει `X-Forwarded-For`.

### Concurrency safety στο checkout

Το `ProductVariant` έχει `@Version` field για optimistic locking. Αν δύο checkouts προσπαθήσουν να μειώσουν το stock του ίδιου variant ταυτόχρονα, η Hibernate ρίχνει `ObjectOptimisticLockingFailureException` → ο `GlobalExceptionHandler` το γυρνάει σαν `409 Conflict` με μήνυμα "Stock changed during checkout. Please review your cart and try again."

---

## Frontend — Τι πρέπει να κάνεις

Το project χρησιμοποιεί **axios** με ένα κεντρικό `apiClient.ts`. Χρειάζονται 3 αλλαγές:

---

### 1. Ενεργοποίηση cookies στο apiClient

Το SESSION cookie στέλνεται αυτόματα από τον browser **μόνο αν** ορίσεις `withCredentials: true`. Χωρίς αυτό, κάθε request είναι "ανώνυμο" για τον server ακόμα και μετά το login.

Άνοιξε το `client/src/services/apiClient.ts` και πρόσθεσε τη γραμμή:

```ts
// client/src/services/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,   // ← αυτό χρειάζεται
});

export default apiClient;
```

Αυτό αρκεί για **όλα** τα υπάρχοντα services (`productsService`, `reviewsService`, κλπ.) — δεν χρειάζεται να αλλάξεις τίποτα άλλο στα requests.

---

### 2. Login / Logout services

Πρόσθεσε ένα `authService.ts` για τα auth calls:

```ts
// client/src/services/authService.ts
import apiClient from "./apiClient";

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export const login = async (email: string, password: string): Promise<UserResponse> => {
  const { data } = await apiClient.post<UserResponse>("/users/login", { email, password });
  return data;
};

export const register = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<UserResponse> => {
  const { data } = await apiClient.post<UserResponse>("/users/register", payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/users/logout");
};
```

---

### 3. Διαχείριση auth state (Zustand)

Χρησιμοποίησε **Zustand** για το auth state — το project το έχει ήδη εγκατεστημένο και είναι πιο απλό από Context:

```ts
// client/src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserResponse, login as apiLogin, logout as apiLogout } from "../services/authService";

interface AuthState {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: async (email, password) => {
        const userData = await apiLogin(email, password);
        set({ user: userData });
      },

      logout: async () => {
        await apiLogout();
        set({ user: null });
      },

      isLoggedIn: () => get().user !== null,
    }),
    {
      name: "auth",         // κλειδί στο localStorage
      partialize: (state) => ({ user: state.user }), // αποθηκεύει μόνο τον user, όχι τις συναρτήσεις
    }
  )
);
```

Το `persist` middleware αποθηκεύει αυτόματα τον user στο `localStorage` — δεν χρειάζεται να κάνεις τίποτα άλλο για persist μετά από refresh.

Δεν χρειάζεται `<AuthProvider>` ή αλλαγές στο `main.tsx` — το Zustand store είναι global αυτόματα.

---

### 4. Χειρισμός 401 (optional — καλή πρακτική)

Αν ο server επιστρέψει 401 (π.χ. έληξε το session), ο axios interceptor καθαρίζει το store και κάνει redirect στο login:

```ts
// client/src/services/apiClient.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.setState({ user: null });
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### Πώς χρησιμοποιείς το auth state σε component

```tsx
import { useAuthStore } from "../store/authStore";

function Navbar() {
  const { user, logout, isLoggedIn } = useAuthStore();

  return (
    <nav>
      {isLoggedIn() ? (
        <>
          <span>Γεια, {user?.firstName}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

---

## Διάρκεια Session

Τρέχουσα ρύθμιση: **24 ώρες** αδράνειας (`server.servlet.session.timeout=24h`).

Για άλλη διάρκεια:

```properties
# application.properties
server.servlet.session.timeout=30m   # 30 λεπτά
server.servlet.session.timeout=1h    # 1 ώρα
```