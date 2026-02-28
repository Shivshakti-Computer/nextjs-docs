---

# 🔐 Next.js Authentication System (JWT + Hybrid Architecture)

> Production-ready authentication system built using Next.js App Router with JWT, HTTP-only cookies, Access & Refresh Tokens, Middleware protection, and Hybrid security architecture.

---

# 📌 Table of Contents

* Introduction
* Authentication Architecture Overview
* Login Workflow (Step-by-Step)
* JWT Deep Explanation
* Token Storage Strategy
* Middleware Protection
* Access & Refresh Token Flow
* Stateless vs Stateful Authentication
* Hybrid Security Model
* Security Best Practices
* Future Enhancements

---

# 🚀 Introduction

This project demonstrates a secure authentication system in **Next.js App Router** using:

* JWT (JSON Web Token)
* HTTP-only cookies
* Access Token (short-lived)
* Refresh Token (long-lived)
* Middleware route protection
* Hybrid database validation approach

This implementation is suitable for:

* SaaS applications
* Enterprise systems
* Banking-level security models
* Scalable architectures

---

# 🏗 Authentication Architecture Overview

```
User Login
    ↓
Server Validates Credentials
    ↓
Access Token (15m)
Refresh Token (7d)
    ↓
HTTP-only Cookie Storage
    ↓
Middleware Verification
    ↓
Protected Route Access
```

---

# 🔐 Login Workflow (Step-by-Step)

## 1️⃣ User Submits Login Form

```ts
// app/login/page.tsx

await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
  headers: { "Content-Type": "application/json" }
});
```

---

## 2️⃣ Server Verifies Credentials

```ts
// app/api/auth/login/route.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const user = await db.user.findUnique({ where: { email } });

if (!user) {
  return Response.json({ message: "User not found" }, { status: 401 });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return Response.json({ message: "Invalid credentials" }, { status: 401 });
}
```

---

## 3️⃣ JWT Generation

```ts
const accessToken = jwt.sign(
  {
    userId: user.id,
    role: user.role
  },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);
```

### Important Notes

* JWT is **signed**, not encrypted
* Secret key is NOT stored inside the token
* Server does NOT store token copy (stateless)

---

# 🍪 Token Storage Strategy

## ❌ LocalStorage (Not Recommended)

* Vulnerable to XSS attacks
* Token can be stolen via JavaScript

---

## ✅ HTTP-Only Cookie (Recommended)

```ts
import { cookies } from "next/headers";

cookies().set("accessToken", accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 15
});
```

Advantages:

* JavaScript cannot access it
* Automatically sent with every request
* Production secure

---

# 🛡 Middleware Protection

```ts
// middleware.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
```

Middleware verifies:

* Token existence
* Signature
* Expiry

---

# 🔄 Access & Refresh Token Architecture

## 🔹 Access Token

* Short-lived (15 minutes)
* Used for route access
* Verified by middleware

## 🔹 Refresh Token

* Long-lived (7 days)
* Stored in HTTP-only cookie
* Stored in database for revocation

---

## Refresh Flow Example

```ts
// app/api/auth/refresh/route.ts

const refreshToken = cookies().get("refreshToken")?.value;

if (!refreshToken) {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!);

// Optional DB validation
const storedToken = await db.refreshToken.findUnique({
  where: { token: refreshToken }
});

if (!storedToken) {
  return Response.json({ message: "Invalid token" }, { status: 403 });
}

const newAccessToken = jwt.sign(
  { userId: decoded.userId },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);
```

---

# 🧠 Stateless vs Stateful Authentication

| Feature                | JWT (Stateless) | Session (Stateful) |
| ---------------------- | --------------- | ------------------ |
| Server Storage         | ❌               | ✅                  |
| Scalability            | ✅               | ⚠️                 |
| Immediate Revoke       | ❌               | ✅                  |
| Role Change Reflection | ❌               | ✅                  |

---

# 🏦 Hybrid Authentication Model (Recommended)

Hybrid = JWT + Database Validation

Flow:

```
JWT Verify
+
Database Check (isActive, role)
+
Refresh Token Tracking
```

Why Hybrid?

* Immediate account disable
* Role update reflection
* Device management
* Logout from all devices

Best for:

* Banking apps
* Enterprise systems
* High-security platforms

---

# 🔐 Security Best Practices

✔ Use short-lived access tokens
✔ Store tokens in HTTP-only cookies
✔ Use Secure + SameSite flags
✔ Hash passwords using bcrypt
✔ Store refresh tokens in database
✔ Implement token rotation
✔ Use rate limiting on login
✔ Protect against CSRF

---

# ⚠ JWT Limitations

If:

* User is banned
* Role changes
* Account disabled

And access token is still valid:

User may continue until expiry unless:

* DB validation is added
* Token is blacklisted
* Refresh token is revoked

---

# 📦 Recommended Folder Structure

```
src/
 ├── app/
 │    ├── api/
 │    │    └── auth/
 │    │         ├── login/
 │    │         ├── refresh/
 │    │         └── logout/
 │    ├── dashboard/
 │    └── login/
 ├── lib/
 │    ├── jwt.ts
 │    └── db.ts
 ├── middleware.ts
```

---

# 🎯 Conclusion

This authentication system provides:

* Stateless JWT verification
* Secure cookie storage
* Scalable architecture
* Hybrid security control
* Production-ready design

It balances:

Security ⚖ Performance ⚖ Scalability

---
