from pydantic import BaseModel, validator
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    due_date: datetime

    @validator('due_date')
    def future_due_date(cls, v):
        if v < datetime.now():
            raise ValueError("Due date must be in the future")
        return v

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    due_date: datetime
    completed: bool

    class Config:
        orm_mode = True

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True
