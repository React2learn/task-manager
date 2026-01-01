# 📝 Task Manager
A full-stack task management application built with a decoupled architecture using **FastAPI** and **Next.js**.



## 🚀 Features
* **FastAPI Backend:** High-performance asynchronous API.
* **Next.js Frontend:** Modern, responsive UI with Server Components.
* **Decoupled Architecture:** Separated concerns for easy scaling.
* **RESTful API:** Clean endpoints for task CRUD operations.

---

## 🛠️ Tech Stack
* **Frontend:** Next.js, Tailwind CSS, TypeScript.
* **Backend:** Python, FastAPI, Pydantic.
* **Database:** (SQLite)
* **Environment:** Virtualenv (Python), NPM/PNPM (Node).

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd task-manager
```
### Backend Setup
#### Go to backend folder
```
cd backend
```

#### Create virtual environment
python -m venv venv


#### Activate environment (Windows)
.\venv\Scripts\activate


#### Activate environment (Mac/Linux)
source venv/bin/activate


#### Install dependencies
pip install -r requirements.txt

#### Start FastAPI server
uvicorn main:app --reload

