"""
app/modules/users/service.py
----------------------------
Business logic for student and domain incharge data.

Cross-module calls: none at this level.
Does NOT import other module models.py or router.py.

TODO: implement get_student_profile(student_id) → StudentProfileResponse
TODO: implement get_domain_incharge_scope(user_id) → track_id | None
      — returns the track_id from domain_incharge for the given admin user.
TODO: implement list_students(department_id?, academic_year_id?) → list[Student]
TODO: implement update_student_profile(student_id, data) → Student
"""


async def get_student_profile(student_id: int) -> dict:
    """
    Return the full profile for a student, including department and academic year.

    TODO: query students JOIN departments JOIN academic_years.
    """
    pass


async def get_domain_incharge_scope(user_id: int) -> int | None:
    """
    Return the track_id that this admin user is scoped to as a domain incharge.
    Returns None if the user is a global admin (not scoped).

    TODO: query domain_incharge by user_id.
    """
    pass
