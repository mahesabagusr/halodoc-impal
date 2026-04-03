# 🧠 Frontend Project Context – Health App (Halodoc-like)

## 📌 Overview
This project is a frontend web application inspired by a digital health platform (similar to Halodoc). The goal is to provide users (patients) with easy access to healthcare services such as online consultations, medicine purchases, and digital prescriptions.

The frontend focuses on building an intuitive, fast, and responsive user interface that integrates seamlessly with backend APIs.

---

## 🛠 Tech Stack
- HTML
- JavaScript
- ReactJS
- TailwindCSS

---

## 🎯 Core Features (Functional Requirements)

### 1. Authentication
- User Registration (OTP-based)
- User Login (OTP verification)
- Secure session handling

### 2. Online Consultation
- View list of available doctors
- Schedule or start consultation
- Chat / voice / video interface (UI only)

### 3. Health Store (E-commerce)
- Browse medicines
- Search and filter products
- Add to cart & checkout flow

### 4. Digital Prescription
- Display e-prescriptions from doctors
- Link prescriptions to medicine purchase

### 5. Payment System
- Show billing details
- Select payment method
- Payment status UI (success / failed)

---

## 👥 User Roles
### Patient
- Register & login
- Consult doctors
- Buy medicine
- Make payments

### Doctor (optional UI scope)
- Accept consultations
- Provide prescriptions

---

## 🧩 UI/UX Goals
- Clean and minimal design (health-tech style)
- Fast and responsive (mobile-first)
- Easy navigation for all age groups
- Focus on usability and clarity

---

## ⚙️ Non-Functional Requirements

- ⚡ Performance: Fast load time (<3s)
- 🔐 Security: OTP authentication UI flow
- 📱 Responsiveness: Mobile + desktop friendly
- 🎯 Usability: Intuitive navigation

---

## 🔗 API Integration (Assumed)
Frontend communicates with backend via REST API:
- Auth (login/register)
- Doctors data
- Consultation sessions
- Products / medicines
- Payments

---

## 🧠 Notes for AI / Assistant

- Prioritize reusable React components
- Use TailwindCSS for styling (utility-first)
- Maintain clean state management (useState/useEffect or context)
- Focus on UI logic, not backend implementation
- Mock data is acceptable if API is not available

---

## 🚀 Expected Output

The frontend should include:
- Pages: Login, Register, Home, Consultation, Store, Payment
- Components: Navbar, Cards, Forms, Modals
- Smooth UX flow from login → consultation → payment

---

## 🧪 Development Focus

- Component-based architecture
- Clean folder structure
- Scalable and maintainable code
- Good UI/UX practices
