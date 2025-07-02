# 🌐 2FA Authentication Website

A modern, responsive React application built with Next.js 15 and React 19, providing a comprehensive two-factor authentication (2FA) interface with support for TOTP authenticators and WebAuthn (Passkeys).

## ✨ Features

### 🔐 Authentication Flows

- **Email/Password Login** - Traditional authentication with secure form validation
- **TOTP Authentication** - Google Authenticator, Authy, and other authenticator app support
- **WebAuthn/Passkeys** - Modern passwordless authentication with biometrics and security keys
- **Registration/Signup** - User account creation with email verification

### 🎨 User Experience

- **Responsive Design** - Mobile-first responsive layout with Tailwind CSS
- **Modern UI Components** - Clean, accessible interface components
- **Real-time Feedback** - Toast notifications and loading states
- **QR Code Generation** - For easy TOTP setup with authenticator apps
- **Passkey Management** - Add, rename, and delete passkeys with intuitive controls

### 🛡️ Security & Performance

- **Client-side Validation** - Zod schema validation with React Hook Form
- **Server State Management** - Efficient data fetching with TanStack Query
- **Type Safety** - Full TypeScript coverage for enhanced development experience
- **Optimized Performance** - Next.js App Router with React Server Components

### 📱 Real-time Features

- **Live Authentication Status** - Instant feedback on authentication changes

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19 with Server Components
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.x
- **State Management**:
    - `@tanstack/react-query` - Server state management
    - React Context - Authentication state
- **Forms**: React Hook Form with Zod validation
- **Authentication**:
    - `@simplewebauthn/browser` - WebAuthn/Passkeys client
    - `axios` - HTTP client with interceptors
- **UI Components**: Custom components with accessibility focus
- **QR Codes**: `qrcode.react` - TOTP QR code generation
- **Notifications**: `react-toastify` - Toast notifications
- **Development**: ESLint, Prettier with Tailwind plugin

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Backend server running (see `chat-app-server` README)

### 1. Clone and Install

```bash
git clone <repository-url>
cd chat-app-website
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional: Development settings
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Production Build

```bash
npm run build
npm start
```

## 📱 Application Structure

### Pages & Routing

#### Public Routes (`/`)

- **Landing Page** (`/`) - Welcome page and app introduction
- **Login** (`/login`) - Email/password authentication
    - **Passkey Login** (`/login/passkey`) - WebAuthn authentication
    - **2FA Verification** (`/login/verify-2fa`) - TOTP token verification
- **Signup** (`/signup`) - User registration

#### Protected Routes (`/(private)`)

- **Dashboard** (`/home`) - User dashboard and overview
- **2FA Setup** (`/setup-2fa`) - TOTP authenticator configuration
- **2FA Disable** (`/disable-2fa`) - Disable two-factor authentication
- **Passkey Management** (`/manage-passkeys`) - View and manage passkeys
    - **Add Passkey** (`/manage-passkeys/add`) - Register new passkey

### Component Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (private)/         # Protected routes with authentication
│   │   ├── layout.tsx     # Private layout with auth check
│   │   ├── home/          # Dashboard page
│   │   ├── setup-2fa/     # TOTP setup page
│   │   ├── disable-2fa/   # TOTP disable page
│   │   └── manage-passkeys/ # Passkey management pages
│   ├── (public)/          # Public routes
│   │   ├── layout.tsx     # Public layout
│   │   ├── login/         # Login pages and flows
│   │   └── signup/        # Registration page
│   ├── globals.css        # Global styles and Tailwind imports
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── form/              # Form-specific components
│   │   └── Input.tsx      # Custom input component
│   ├── providers/         # React context providers
│   │   ├── AuthProvider.tsx    # Authentication context
│   │   ├── UserProvider.tsx    # User data context
│   │   └── index.tsx           # Combined providers
│   ├── Navbar.tsx         # Navigation component
│   └── ScreenLoader.tsx   # Loading screen component
├── libs/                  # Core libraries and configurations
│   └── axiosInterceptor.ts # Axios configuration with auth
└── utils/                 # Utility functions
    └── env.ts             # Environment variable validation
```

## 🔗 API Integration

The website communicates with the backend server through RESTful APIs.

### Authentication Flow

1. **Login Process**:

    ```typescript
    // Email/Password login
    POST /api/auth/login
    → Returns: { requires2FA: boolean, tempToken?: string, accessToken?: string }

    // If 2FA required
    POST /api/auth/login/2fa
    → Returns: { accessToken: string, user: UserData }
    ```

2. **TOTP Setup**:

    ```typescript
    // Get setup data
    POST /api/auth/totp/setup
    → Returns: { secret: string, qrCode: string }

    // Verify setup
    POST /api/auth/totp/verify
    → Returns: { success: boolean }
    ```

3. **Passkey Registration**:

    ```typescript
    // Get registration options
    GET /api/auth/passkey/registration/options
    → Returns: WebAuthn creation options

    // Verify registration
    POST /api/auth/passkey/registration/verify
    → Returns: { success: boolean }
    ```

### State Management

#### Authentication State

```typescript
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
}
```

#### Server State (TanStack Query)

- User data queries
- Authentication mutations
- Passkey management queries
- Real-time cache updates

## 🎨 UI/UX Features

### Responsive Design

- **Mobile-first approach** - Optimized for mobile devices
- **Tablet and desktop scaling** - Responsive layouts for all screen sizes
- **Touch-friendly interactions** - Large touch targets and gestures

### Accessibility

- **Keyboard navigation** - Full keyboard accessibility
- **Screen reader support** - Proper ARIA labels and semantic HTML
- **Color contrast** - WCAG compliant color schemes
- **Focus management** - Clear focus indicators and logical tab order

### Loading States

- **Skeleton screens** - Loading placeholders for better UX
- **Progressive enhancement** - Core functionality works without JavaScript
- **Error boundaries** - Graceful error handling and recovery

### Form Validation

```typescript
// Example Zod schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Style & Standards

- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Modern JavaScript/TypeScript linting rules
- **Prettier**: Automatic code formatting with Tailwind class sorting
- **Functional Components**: React functional components with hooks
- **Server Components**: Use RSCs by default, client components only when needed

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Build Configuration

The application uses Next.js 15 with:

- **App Router** - File-based routing with layouts
- **Turbopack** - Fast development builds
- **Server Components** - Improved performance and SEO
- **Automatic Code Splitting** - Optimized bundle sizes

## 🔐 Security Features

### Client-side Security

- **Input Sanitization** - All user inputs validated and sanitized
- **XSS Protection** - Secure content rendering
- **CSRF Protection** - Token-based request verification
- **Secure Authentication** - JWT tokens with secure storage

### WebAuthn Implementation

```typescript
// Passkey registration example
const credential = await startRegistration(options);
const response = await fetch("/api/auth/passkey/registration/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, name: passkeyName }),
});
```

### Data Validation

- **Zod Schemas** - Runtime type validation
- **Form Validation** - Real-time client-side validation
- **API Response Validation** - Server response type checking

## 🧪 Testing Strategy

### Unit Testing (Future Implementation)

```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Testing Stack (Recommended)

- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for integration tests
- **Playwright** - End-to-end testing

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

## 🔄 Integration with Backend

### API Base URL Configuration

The frontend automatically configures API requests based on the environment:

```typescript
// Development
const API_URL = "http://localhost:8000/api";

// Production
const API_URL = "https://your-production-api.com/api";
```

### Real-time Communication

```typescript
// HTTP API communication using axios
    auth: {
        token: localStorage.getItem("accessToken"),
    },
});
```

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style guidelines
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
    - Verify backend server is running
    - Check `NEXT_PUBLIC_API_URL` environment variable
    - Ensure CORS is properly configured on the backend

2. **WebAuthn/Passkey Issues**
    - Ensure HTTPS in production (required for WebAuthn)
    - Check browser compatibility
    - Verify proper domain configuration

3. **Build Errors**
    - Clear `.next` cache: `rm -rf .next`
    - Reinstall dependencies: `rm -rf node_modules && npm install`
    - Check TypeScript errors: `npm run lint`

### Performance Optimization

- Use Next.js `Image` component for optimized images
- Implement proper loading states
- Leverage React Server Components where possible
- Use dynamic imports for heavy components

## 📧 Support

For support and questions, please open an issue in the GitHub repository.

---

**Enjoy building secure authentication experiences! 🔐✨**
