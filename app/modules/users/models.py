"""
app/modules/users/models.py
---------------------------
ORM model placeholders for student and department-related tables.

Tables covered: students, departments, domain_incharge, academic_years.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions and relationships.
"""


class Department:
    """
    Table: departments
        # id: INTEGER (PK)
        # name: VARCHAR
    """
    pass


class AcademicYear:
    """
    Table: academic_years
        # id: INTEGER (PK)
        # label: VARCHAR
    """
    pass


class Student:
    """
    Table: students
        # id: INTEGER (PK)
        # user_id: INTEGER (FK → users)
        # department_id: INTEGER (FK → departments)
        # academic_year_id: INTEGER (FK → academic_years)
        # roll_number: VARCHAR
    """
    pass


class DomainIncharge:
    """
    An admin user scoped to a specific track.
    This is NOT a separate role — the user must have role 'admin'.

    Table: domain_incharge
        # id: INTEGER (PK)
        # user_id: INTEGER (FK → users)
        # track_id: INTEGER (FK → tracks)
    """
    pass
