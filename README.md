# Thoth Client - Frontend Application

> **Frontend client for the Thoth Cloud Storage Solution**

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)

> **⚠️ Important Notice**
> 
> 🚧 **This project is currently under active development** 🚧
> 
> Thoth Client is not yet ready for production use. The UI components, features, and API integrations are subject to change without notice. We recommend against using this in production environments until a stable release is available.

## 🏛️ About Thoth Client

Thoth Client is the modern, responsive frontend application for the [Thoth Cloud Storage Solution](https://github.com/Mahmoud02/thoth). Built with React and TypeScript, it provides an intuitive web interface for managing files, buckets, namespaces, and AI-powered file analysis.

### 🔗 Backend Service

This frontend application is designed to work with the **Thoth Backend Service**:
- **Repository**: [https://github.com/Mahmoud02/thoth](https://github.com/Mahmoud02/thoth)
- **Architecture**: Hexagonal Architecture (Ports & Adapters)
- **Technology**: Java 17+, Spring Boot 3.x, PostgreSQL
- **API**: RESTful API with Swagger documentation

## ✨ Features

### 🗂️ **File Management**
- **Upload Files**: Drag-and-drop or click-to-upload interface
- **File Organization**: Organize files into logical buckets
- **File Validation**: Built-in validation for file size, type, and security
- **AI Processing**: Manual file ingestion for AI analysis

### 🏷️ **Namespace Management**
- **Multi-tenancy**: Support for different organizations or teams
- **CRUD Operations**: Create, read, update, and delete namespaces
- **Filtering**: Filter buckets by namespace

### 🤖 **AI-Powered Features**
- **AI Chat**: Interactive chat interface for file analysis
- **RAG Integration**: Query files using Retrieval-Augmented Generation
- **Context Overview**: Automatic context analysis when selecting buckets
- **Smart Suggestions**: AI-generated questions based on file content

### ⚙️ **Function Management**
- **Custom Functions**: Configure processing functions for buckets
- **Dynamic Forms**: Auto-generated forms based on function properties
- **Function Chains**: Define processing workflows
- **Real-time Configuration**: Live updates to function settings

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Professional appearance with glass morphism effects
- **Real-time Updates**: Live data synchronization
- **Intuitive Navigation**: Clean, organized sidebar navigation

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Thoth Backend**: Running instance of the [Thoth backend service](https://github.com/Mahmoud02/thoth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mahmoud02/thoth-client.git
   cd thoth-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the backend URL**:
   Update the API base URL in `src/services/api.ts` to point to your Thoth backend instance.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Backend Setup

Make sure you have the Thoth backend service running:

1. **Clone and setup the backend**:
   ```bash
   git clone https://github.com/Mahmoud02/thoth.git
   cd thoth
   ```

2. **Start the backend services**:
   ```bash
   docker-compose -f development-dependencies.yml up -d
   mvn spring-boot:run
   ```

3. **Access backend documentation**:
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - API Docs: `http://localhost:8080/v3/api-docs`

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── AI/              # AI chat and analysis components
│   ├── Auth/            # Authentication components
│   ├── Buckets/         # Bucket management components
│   ├── Functions/       # Function configuration components
│   ├── Layout/          # Layout and navigation components
│   ├── Namespaces/      # Namespace management components
│   └── ui/              # Reusable UI components (shadcn/ui)
├── contexts/            # React contexts (Auth, etc.)
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API services and client
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for git hooks

## 🌐 API Integration

The frontend communicates with the Thoth backend through RESTful APIs:

- **Authentication**: JWT-based authentication
- **File Operations**: Upload, download, delete files
- **Bucket Management**: CRUD operations for buckets
- **Namespace Management**: Multi-tenant namespace operations
- **AI Services**: RAG queries and file ingestion
- **Function Management**: Configure processing functions

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Thoth Client
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to help improve Thoth Client.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Thoth Backend**: Built to work seamlessly with the [Thoth backend service](https://github.com/Mahmoud02/thoth)
- **shadcn/ui**: For the beautiful UI component library
- **React Community**: For the amazing ecosystem and tools
- **Open Source**: Built with love for the open-source community

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/Mahmoud02/thoth-client/issues)
- **Backend Issues**: [Thoth Backend Issues](https://github.com/Mahmoud02/thoth/issues)
- **Documentation**: Check the backend [API documentation](https://github.com/Mahmoud02/thoth#-api-documentation)

---

**Thoth Client** - *The modern frontend for intelligent file storage* 🏛️