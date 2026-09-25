# Domains Module

Manages the track → level → topic → subtopic hierarchy.

## Tables
- `tracks` — top-level domain areas.
- `levels` — progression levels within a track.
- `topics` — ordered topics within a level (`sequence_no`).
- `subtopics` — ordered subtopics within a topic (`sequence_no`).

## Key Rules
- No PDFs or external documents — content is only `name` + `description` text.
- Topics and subtopics **must** be returned ordered by `sequence_no`.
- Level detail page shows only topics/subtopics needed for that level.
- AI engine reads topic/subtopic `name` + `description` from this module's service layer.
