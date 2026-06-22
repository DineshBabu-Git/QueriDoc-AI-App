# 🚀 Queridoc AI - A Multi-document chat platform using AI Rag

Queridoc AI is an intelligent AI-powered document question-answering platform that allows users to upload documents and interact with them using natural language queries.

Built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) and Google Gemini AI, Queridoc AI uses Retrieval-Augmented Generation (RAG) techniques to retrieve relevant document content and generate accurate responses based only on the uploaded document.

---

## 🌟 Features

### 🔐 Authentication & Security

- User Registration & Login
- JWT Authentication
- Protected Routes
- Secure Password Hashing with bcrypt
- Environment Variable Protection
- Input Validation & Error Handling

### 📄 Document Management

- Upload PDF, DOCX, TXT, and Markdown Files
- Cloudinary-Based File Storage
- Document Dashboard
- Rename Documents
- Delete Documents
- Document Metadata Tracking
- Upload Limit Configuration (Up to 20 MB)

### 🤖 AI-Powered Chat

- Ask Questions About Uploaded Documents
- Context-Aware Responses
- Retrieval-Augmented Generation (RAG)
- Google Gemini 2.5 Flash Integration
- Chat History Persistence
- Per-Document Conversations
- Smart Context Construction

### ⚡ Smart Retrieval Engine

- Text Extraction
- Intelligent Chunking
- Keyword Extraction
- Chunk Relevance Scoring
- Duplicate Chunk Removal
- Context Optimization
- Retrieval Debugging Support

### ☁️ Cloud Storage

- Cloudinary Integration
- Secure File Uploads
- Remote File Management
- Automatic File Cleanup on Deletion

### 🎨 User Experience

- Responsive UI
- Dashboard Navigation
- Loading States
- Error Handling
- Modern React Components
- Clean User Interface

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- React Hook Form
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary

### AI & NLP

- Google Gemini 2.5 Flash
- Retrieval-Augmented Generation (RAG)
- Keyword-Based Retrieval Engine

---

## 🚀 Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)
- Cloudinary (File Storage)

---

## 🏗️ Project Architecture

```text
User
 │
 ▼
React Frontend
 │
 ▼
Express API
 │
 ├── Authentication
 │
 ├── Document Upload
 │
 ├── Document Processing
 │
 └── Chat System
        │
        ▼
   Retrieval Engine
        │
        ▼
 Relevant Chunks
        │
        ▼
 Google Gemini AI
        │
        ▼
 Generated Answer
```

---

## 📂 Folder Structure

```text
queridoc-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                        | Description                               | Auth Required |
| ------ | ------------------------------- | ----------------------------------------- | ------------- |
| `POST` | `/api/auth/register`            | Register a new user                       | ❌            |
| `POST` | `/api/auth/login`               | Login and receive a JWT                   | ❌            |
| `POST` | `/api/documents/upload`         | Upload and process a document             | ✅            |
| `GET`  | `/api/documents`                | List all documents for the logged-in user | ✅            |
| `POST` | `/api/chat/message`             | Send a message and get an AI response     | ✅            |
| `GET`  | `/api/chat/history/:documentId` | Get chat history for a document           | ✅            |
| `GET`  | `/api/chat`                     | Get all chats for the logged-in user      | ✅            |

All protected routes require an `Authorization: Bearer <token>` header, where `<token>` is the JWT received from `/api/auth/login`.

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone

cd queridoc-ai
```

---

### 📦 Backend Setup

Navigate to server folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE=20971520

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:

```bash
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

## 🎨 Frontend Setup

Open new terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔑 Getting Gemini API Key

1. Visit Google AI Studio

https://aistudio.google.com

2. Sign in with Google Account

3. Create API Key

4. Copy API Key

5. Add key to:

```env
GOOGLE_GEMINI_API_KEY=YOUR_API_KEY
```

---

## 📚 How QueriDoc AI Works

### Step 1

User uploads a document and It is stored in Cloudinary.

### Step 2

Document text is extracted.

### Step 3

Text is split into chunks.

Example:

```text
Chunk 1
Chunk 2
Chunk 3
Chunk 4
```

### Step 4

Keywords are extracted from each chunk.

### Step 5

When user asks a question:

```text
Where does Sarah live?
```

Relevant chunks are retrieved.

### Step 6

Context is built:

```text
Sarah is a product manager.
She lives in Bangalore.
```

### Step 7

Context + Question are sent to Gemini AI.

### Step 8

Gemini generates answer:

```text
Sarah lives in Bangalore.
```

---

## 🔄 Retrieval-Augmented Generation (RAG)

Queridoc AI follows a RAG pipeline:

```text
Document Upload
      │
      ▼
Cloudinary Storage
      │
      ▼
Text Extraction
      │
      ▼
Chunk Creation
      │
      ▼
Keyword Extraction
      │
      ▼
Question
      │
      ▼
Chunk Retrieval
      │
      ▼
Context Building
      │
      ▼
Gemini 2.5 Flash
      │
      ▼
Final Answer
```

---

## 🧪 Example Questions

Given a document:

```text
Sarah is a product manager.
She lives in Bangalore.
```

Questions:

```text
Where does Sarah live?
```

Answer:

```text
Sarah lives in Bangalore.
```

---

Question:

```text
What is Sarah's role?
```

Answer:

```text
Sarah is a product manager.
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Environment Variables
- Input Validation
- File Upload Validation
- Cloudinary Secure Storage
- API Error Handling

---

## 📈 Future Improvements

- Vector Database Integration
- Embedding-Based Retrieval
- OpenAI Support
- Claude AI Support
- Multi-Document Chat
- Document Summarization
- OCR for Scanned PDFs
- Role-Based Access Control
- Team Workspaces

---

## 🐞 Known Limitations

- Free Gemini API quota limitations
- Document upload size limitations (Upto 20MB)
- No vector embeddings currently
- Retrieval based on keyword matching
- Large document processing may take longer

---

## 🧾 License

This project is open-source and free to use for educational and personal projects. For commercial use, please contact the author for licensing options.

---
