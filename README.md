# ✅ Next.js Todo App

A clean, fast, full-stack todo list app built with **Next.js** and a lightweight **SQLite** database. No external services, no config headaches — clone it, install, and run.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

## ✨ Features

- 📝 Create, read, update, and delete tasks
- 💾 Persistent storage with SQLite — data survives restarts
- ⚡ Server-side API routes powered by Next.js
- 🎯 Simple, distraction-free UI
- 🔁 Instant updates without a page reload
- 📦 Zero external database setup — SQLite runs locally out of the box

---

## 🖥️ Tech Stack

| Layer      | Technology       |
|------------|------------------|
| Framework  | Next.js          |
| Language   | JavaScript       |
| Database   | SQLite           |
| Styling    | CSS / Next.js defaults |
| Runtime    | Node.js          |

---

## 📁 Project Structure

```
nextjs-todo-app/
├── pages/              # Routes & API endpoints
│   ├── api/            # Backend logic (CRUD routes)
│   └── index.js        # Main todo page
├── components/         # Reusable UI components
├── db/                 # SQLite database file & connection setup
├── styles/             # CSS files
├── public/             # Static assets
├── package.json
└── README.md
```

> Adjust this section if your actual folder layout differs.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/OmKaran1111111/nextjs-todo-app.git

# Move into the project
cd nextjs-todo-app

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running. 🎉

The SQLite database file will be created automatically on first run if it doesn't already exist.

---

## 🗃️ Database

This project uses **SQLite** as a simple, file-based database — perfect for local development and small deployments.

- Database file lives in the project directory (e.g. `db/todos.sqlite`)
- No separate database server required
- Tables are created automatically on first launch

---

## 🧭 API Routes

| Method | Route            | Description          |
|--------|------------------|-----------------------|
| GET    | `/api/todos`     | Fetch all todos       |
| POST   | `/api/todos`     | Create a new todo     |
| PUT    | `/api/todos/:id` | Update an existing todo |
| DELETE | `/api/todos/:id` | Delete a todo         |

> Update this table to match your actual endpoint names if they differ.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 💬 Feedback

Found a bug or have an idea? Open an [issue](https://github.com/OmKaran1111111/nextjs-todo-app/issues) — contributions and suggestions are always appreciated.

---

<p align="center">Made with ☕ and Next.js</p>