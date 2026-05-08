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

Ορίζονται στο `SecurityConfig.java`:

```
Public (δεν απαιτεί login):
  POST  /api/users/login
  POST  /api/users/register
  POST  /api/users/logout
  GET   /api/products/**
  GET   /api/categories/**
  GET   /api/reviews/**
  GET   /api/app-reviews/**

Login required (οποιοσδήποτε logged-in user):
  /api/cart/**
  /api/orders/**
  /api/wishlist/**
  /api/addresses/**
  /api/users/{id}  (GET, PUT, DELETE)

Admin only (ROLE_ADMIN):
  /api/admin/**
```

Για να προσθέσεις νέο protected endpoint, δεν χρειάζεται να αλλάξεις τίποτα — το `anyRequest().authenticated()` καλύπτει αυτόματα οτιδήποτε δεν έχει οριστεί ρητά ως public.

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

### 3. Διαχείριση auth state (Context)

Χρειάζεσαι ένα `AuthContext` για να ξέρει όλη η εφαρμογή αν ο user είναι logged in:

```tsx
// client/src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { UserResponse, login as apiLogin, logout as apiLogout } from "../services/authService";

interface AuthContextType {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);

  const login = async (email: string, password: string) => {
    const userData = await apiLogin(email, password);
    setUser(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
```

Στο `main.tsx`, τύλιξε την εφαρμογή με `<AuthProvider>`:

```tsx
// client/src/main.tsx
<AuthProvider>
  <CartProvider>
    <App />
  </CartProvider>
</AuthProvider>
```

---

### 4. Χειρισμός 401 (optional — καλή πρακτική)

Αν ο server επιστρέψει 401 (π.χ. έληξε το session), ο axios interceptor μπορεί να κάνει αυτόματα redirect στο login:

```ts
// client/src/services/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <nav>
      {isLoggedIn ? (
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

### Σημαντικό: Persist login μετά από refresh

Το `useState` χάνει την τιμή του μετά από page refresh. Αν θέλεις ο user να παραμένει logged in μετά από refresh, πρέπει να κάνεις ένα `/api/users/me` endpoint που επιστρέφει τον logged-in user βάσει του session, και να το καλείς στο mount του `AuthProvider`:

```tsx
// Μέσα στο AuthProvider
useEffect(() => {
  apiClient.get<UserResponse>("/users/me")
    .then(({ data }) => setUser(data))
    .catch(() => setUser(null));
}, []);
```

Αυτό το endpoint δεν υπάρχει ακόμα — θα χρειαστεί να το προσθέσεις στον backend.

---

## Διάρκεια Session

Default: **30 λεπτά** αδράνειας. Για να το αλλάξεις:

```properties
# application.properties
server.servlet.session.timeout=1h   # 1 ώρα
```