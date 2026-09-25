# Exams Module

Admin-only module for creating and managing assessment (exam) definitions.

## Tables
- `assessments` — exam definition: tied to a level, with duration and status.

## Key Rules
- Only admins can create or modify assessments.
- Assessments must be in `active` status before slots can be created for them.
- Status transitions: `draft` → `active` → `archived`.
- `slots/` module references assessments via `assessment_id` — do NOT import `exams/models.py` in slots; call `exams/service.get_assessment()` instead.
