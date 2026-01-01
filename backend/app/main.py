from fastapi import FastAPI
from app.routes import tasks
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include routes
app.include_router(tasks.router)
