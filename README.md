# Espresso Framework

A lightweight, zero-dependency web framework built with TypeScript and Node.js. Espresso provides a modern, fast, and flexible foundation for building web applications without external dependencies.

## Features

### Core Framework

- **Zero Dependencies** - Built entirely with Node.js built-in modules
- **TypeScript Support** - Full TypeScript integration with type safety
- **Trie Router** - High-performance routing with support for dynamic parameters
- **Middleware System** - Flexible middleware architecture for request processing
- **Template Engine** - Built-in template rendering with partials support
- **Static File Serving** - Efficient static asset delivery
- **Custom Logger** - Configurable logging with multiple transport options

### Built-in Middleware

- **CORS Support** - Cross-origin resource sharing configuration
- **Custom Logging** - Request/response logging with custom formatting
- **Static Files** - Automatic static file serving with caching

### Advanced Features

- **Streaming Support** - Video and file streaming capabilities
- **File Attachments** - Handle file uploads and downloads
- **Error Handling** - Comprehensive error handling and custom error pages
- **Request/Response Objects** - Enhanced HTTP request and response handling

### Core Components

```
src/
├── Espresso/
│   ├── Server.ts          # Main server class
│   ├── Router.ts          # Trie-based router
│   ├── Request.ts         # Enhanced request object
│   ├── Response.ts        # Enhanced response object
│   ├── Middleware.ts      # Middleware system
│   ├── types.ts           # TypeScript type definitions
│   └── lib/
│       ├── logger/        # Custom logging system
│       └── template-engine/ # Template rendering engine
├── controller/            # Application controllers
├── middlewares/          # Custom middleware
├── views/               # HTML templates
└── public/              # Static assets
```

### Request Flow

1. **HTTP Request** → Server receives request
2. **Middleware Chain** → Request passes through configured middleware
3. **Router Matching** → Trie router finds matching route
4. **Controller Execution** → Route handler processes request
5. **Response Generation** → Response sent back to client

## Installation

### Prerequisites

- Node.js 22+
- TypeScript 4.5+

### Setup

```bash
# Clone the repository
git clone <https://github.com/devmunira/RawFramework>
cd no-npm-framework

# Install dependencies (only TypeScript for development)
npm install

# Build the project
npm run build

# Start the server
npm start
```

**Espresso Framework** - Brewing fast, lightweight web applications with zero dependencies! ☕
