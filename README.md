# DRP – Data Request Portal

A modern web application for collecting market data through questionnaires. Built for the Czech Office for the Protection of Competition (ÚOHS).

## Features

- **Questionnaire Builder** - Visual editor for creating forms with various question types
- **Respondent Management** - Add, import, and manage respondents with unique access tokens
- **Multi-language Support** - Czech, Slovak, and English localization
- **Real-time Autosave** - Automatic saving of respondent answers
- **File Uploads** - Support for file attachments per question
- **Export Options** - CSV, Excel (XLSX), and ZIP export with all files
- **Access Control** - Token-based access for editors and respondents

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **react-i18next** for internationalization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** for authentication
- **Multer** for file uploads
- **ExcelJS** for exports

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zbysekmartoch/drp.git
cd drp
```

2. **Set up the database**
```bash
mysql -u root -p < backend/schema.sql
```

3. **Configure environment**
```bash
cp backend/.env.example backend/.env
# Edit .env with your database credentials
```

4. **Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

5. **Start the servers**
```bash
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm run dev
```

6. **Open the application**
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## Project Structure

```
drp/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry point
│   │   ├── routes/
│   │   │   ├── public.js     # Public API routes
│   │   │   ├── editor.js     # Editor API routes
│   │   │   └── respondent.js # Respondent API routes
│   │   └── middleware/
│   │       └── auth.js       # Authentication middleware
│   ├── uploads/              # Uploaded files storage
│   └── schema.sql            # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React contexts
│   │   ├── i18n/             # Translations (cs, sk, en)
│   │   └── api.js            # API client
│   └── index.html
│
└── README.md
```

## Question Types

| Type | Description |
|------|-------------|
| short_text | Single-line text input |
| long_text | Multi-line textarea |
| radio | Single choice from options |
| checkbox | Multiple choice from options |
| scale | Numeric scale with labels |
| file | File upload |

## Localization

The application supports three languages:
- 🇨🇿 Czech (cs) - default
- 🇸🇰 Slovak (sk)
- 🇬🇧 English (en)

Translation files are located in \`frontend/src/i18n/locales/\`.

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
