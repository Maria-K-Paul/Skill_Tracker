"""
app/modules/exams/service.py
-----------------------------
Business logic for assessment creation and management (admin only).

Cross-module calls: none directly — slots/ calls exams/service to validate assessment state.
Does NOT import other module models.py or router.py.

TODO: implement create_assessment(level_id, title, duration_minutes, created_by) → Assessment
TODO: implement get_assessment(assessment_id) → Assessment
TODO: implement update_assessment_status(assessment_id, status) → Assessment
TODO: implement list_assessments(level_id?) → list[Assessment]
TODO: validate that an assessment must be 'active' before a slot can be created for it.
"""


async def create_assessment(
    level_id: int, title: str, duration_minutes: int, created_by: int
) -> dict:
    """Create a new assessment for the given level. Admin only."""
    # TODO: insert into assessments table with status='draft'
    pass


async def get_assessment(assessment_id: int) -> dict:
    """Return assessment by ID. Raises NotFoundError if missing."""
    # TODO: query assessments by id
    pass


async def update_assessment_status(assessment_id: int, status: str) -> dict:
    """Transition assessment status (draft → active → archived)."""
    # TODO: validate status transition, update record
    pass
