from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.modules.users.models import User, Student

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.user_id == current_user["id"]))
    student = result.scalars().first()
    return {"user": current_user["user"], "student": student, "roles": current_user["roles"]}

@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_admin)):
    result = await db.execute(select(User))
    return result.scalars().all()
