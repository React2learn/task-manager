from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import io

from app import schemas, crud, database, auth, models
from app.utils import get_current_user

import pandas as pd
import os
from datetime import datetime

router = APIRouter(prefix="/api", tags=["API"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------- DB DEPENDENCY ----------------

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTH ----------------

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    return crud.create_user(db, user)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = auth.create_access_token(
        data={"sub": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ---------------- TASKS (PROTECTED) ----------------

@router.post("/tasks", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Link the task to the logged-in user
    db_task = models.Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks", response_model=list[schemas.TaskResponse])
def list_tasks(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Only return tasks belonging to this user
    return db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()


@router.patch("/tasks/{task_id}/complete", response_model=schemas.TaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = True
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}


# ---------------- IMPORT ROUTE ----------------

@router.post("/tasks/import")
async def import_tasks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Please upload an Excel file.")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The Excel file is empty.")

        # --- THE FIX: Convert due_date column to actual datetime objects ---
        if "due_date" in df.columns:
            # errors='coerce' turns invalid dates into NaT (Not a Time)
            df['due_date'] = pd.to_datetime(df['due_date'], errors='coerce')
        # ------------------------------------------------------------------

        count = 0
        for _, row in df.iterrows():
            # Handle the case where due_date might be missing or invalid
            due_val = row.get("due_date")
            
            # If pandas failed to parse it or it's null, use current time
            if pd.isna(due_val):
                due_val = datetime.now()

            new_task = models.Task(
                title=str(row.get("title", "Untitled Task")),
                description=str(row.get("description", "")),
                # WE PASS THE OBJECT DIRECTLY, NOT A STRING
                due_date=due_val, 
                completed=bool(row.get("completed", False)),
                owner_id=current_user.id
            )
            db.add(new_task)
            count += 1

        db.commit()
        return {"message": f"Successfully imported {count} tasks"}

    except Exception as e:
        db.rollback() # Rollback 
        print(f"Import Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Server failed to process file: {str(e)}"
        )

# ---------------- EXPORT ROUTE ----------------

@router.get("/tasks/export")
def export_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found to export")

    df = pd.DataFrame([{
        "title": t.title,
        "description": t.description,
        "due_date": t.due_date,
        "completed": t.completed
    } for t in tasks])

    filename = f"tasks_export.xlsx"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Using openpyxl engine explicitly
    df.to_excel(filepath, index=False, engine='openpyxl')

    return FileResponse(
        filepath,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=filename
    )