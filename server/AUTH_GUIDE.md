# Authentication & Session Guide

## Τι υλοποιήθηκε

Το σύστημα χρησιμοποιεί **Spring Security** για authentication/authorization και **Spring Session JDBC** για αποθήκευση sessions στη βάση δεδομένων.

---

## Αρχεία που άλλαξαν / δημιουργήθηκαν

| Αρχείο | Τι κάνει |
|--------|----------|
| `config/SecurityConfig.java` | Κεντρική ρύθμιση Security — ποια endpoints απαιτούν login, BCrypt, CORS |
| `service/UserDetailsServiceImpl.java` | Φορτώνει user από τη βάση για λογαριασμό του Spring Security |
| `controller/UserController.java` | Login/logout endpoints με session management |
| `service/UserService.java` | BCrypt hashing στο register/update password |
| `config/DataInitializer.java` | Test users δημιουργούνται με hashed password |
| `resources/application.properties` | Ενεργοποίηση JDBC session store |

---

## Πώς λειτουργεί το Session (βήμα-βήμα)

### 1. Login

```
POST /api/users/login
Body: { "email": "user@example.com", "password": "mypassword" }
```

**Τι γίνεται στον server:**

```
1. AuthenticationManager.authenticate()
       ↓
2. UserDetailsServiceImpl.loadUserByUsername(email)
       ↓  φορτώνει User από βάση
3. BCrypt.matches(rawPassword, storedHash)
       ↓  αν δεν ταιριάζει → 401 Unauthorized
4. Δημιουργία SecurityContext με το Authentication object
       ↓
5. Αποθήκευση SecurityContext στο HTTP Session
       ↓
6. Spring Session JDBC αποθηκεύει το session στη βάση (πίνακας SPRING_SESSION)
       ↓
7. Server επιστρέφει cookie: SESSION=<uuid>  +  UserResponse JSON
```

**Response headers:**
```
Set-Cookie: SESSION=abc123xyz; Path=/; HttpOnly; SameSite=Lax
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

Το `spring.session.jdbc.initialize-schema=always` δημιουργεί αυτόματα:

```sql
SPRING_SESSION
├── PRIMARY_ID       -- UUID του session
├── SESSION_ID       -- το ID που πηγαίνει στο cookie
├── CREATION_TIME    -- πότε δημιουργήθηκε
├── LAST_ACCESS_TIME -- τελευταία χρήση
├── MAX_INACTIVE_INTERVAL -- timeout σε δευτερόλεπτα (default: 1800 = 30 λεπτά)
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
| `* /api/users/{userId}/wishlist/**` | `userId` == logged-in user | `UserService.requireSelf()` |
| `* /api/users/{userId}/addresses/**` | `userId` == logged-in user | `UserService.requireSelf()` |
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

> **Προσοχή:** Οι ήδη υπάρχοντες users στη βάση με plain text passwords δεν θα μπορούν να κάνουν login. Πρέπει να γίνει wipe της βάσης (ή να τρέξεις UPDATE query με hashed τιμές).

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

Default: **30 λεπτά** αδράνειας. Για να το αλλάξεις:

```properties
# application.properties
server.servlet.session.timeout=1h   # 1 ώρα
```