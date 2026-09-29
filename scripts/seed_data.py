import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.core.config import settings
from app.modules.users.models import User, Department, AcademicYear, Student
from app.modules.auth.models import Role, UserRole
from app.modules.domains.models import Track, Level, Topic, Subtopic
from app.core.security import hash_password

async def main():
    print("Seeding database...")
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        # Create roles
        student_role = Role(name="student")
        admin_role = Role(name="admin")
        session.add_all([student_role, admin_role])
        await session.flush()

        # Create department & academic year
        dept = Department(name="Computer Science")
        year = AcademicYear(label="2026-2027")
        session.add_all([dept, year])
        await session.flush()

        # Create admin user
        admin_user = User(
            email="admin@college.edu",
            password_hash=hash_password("admin123"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(admin_user)
        await session.flush()
        
        session.add(UserRole(user_id=admin_user.id, role_id=admin_role.id))

        # Create student user
        student_user = User(
            email="student@college.edu",
            password_hash=hash_password("student123"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(student_user)
        await session.flush()

        session.add(UserRole(user_id=student_user.id, role_id=student_role.id))

        # Create student profile
        student_profile = Student(
            user_id=student_user.id,
            department_id=dept.id,
            academic_year_id=year.id,
            roll_number="CS26001"
        )
        session.add(student_profile)

        # Create Track -> Level -> Topic -> Subtopic
        track = Track(name="Web Development", description="Fullstack web dev track")
        session.add(track)
        await session.flush()

        level1 = Level(track_id=track.id, level_no=1, name="Beginner", description="HTML, CSS, JS basics")
        session.add(level1)
        await session.flush()

        topic1 = Topic(level_id=level1.id, name="HTML5", description="Semantic HTML", sequence_no=1)
        topic2 = Topic(level_id=level1.id, name="CSS3", description="Styling and layout", sequence_no=2)
        session.add_all([topic1, topic2])
        await session.flush()

        subtopic1 = Subtopic(topic_id=topic1.id, name="Forms", description="Input elements", sequence_no=1)
        subtopic2 = Subtopic(topic_id=topic1.id, name="Flexbox", description="CSS Flex layout", sequence_no=1)
        session.add_all([subtopic1, subtopic2])

        await session.commit()
        print("Data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(main())
