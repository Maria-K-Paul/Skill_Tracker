"""
app/modules/attempts/models.py
--------------------------------
ORM model placeholders for attempt, answer, result, session, and proctoring tables.

Tables covered: attempts, attempt_answers, results, topic_results,
                exam_sessions, proctoring_events.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
"""


class Attempt:
    """
    One try at a level, linked to a slot_booking.
    attempt_no tracks which attempt this is (1, 2, or 3).

    Table: attempts
        # id: INTEGER (PK)
        # slot_booking_id: INTEGER (FK → slot_bookings)
        # student_id: INTEGER (FK → students)
        # assessment_id: INTEGER (FK → assessments)
        # attempt_no: INTEGER
        # started_at: TIMESTAMP
        # submitted_at: TIMESTAMP
        # status: VARCHAR
    """
    pass


class AttemptAnswer:
    """
    One answer row per question in an attempt.

    Table: attempt_answers
        # id: INTEGER (PK)
        # attempt_id: INTEGER (FK → attempts)
        # question_id: INTEGER (FK → questions)
        # selected_option_id: INTEGER (FK → question_options)
        # answered_at: TIMESTAMP
    """
    pass


class Result:
    """
    Computed result after attempt submission.

    Table: results
        # id: INTEGER (PK)
        # attempt_id: INTEGER (FK → attempts)
        # total_marks: INTEGER
        # scored_marks: INTEGER
        # percentage: FLOAT
        # verdict: VARCHAR
        # computed_at: TIMESTAMP
    """
    pass


class TopicResult:
    """
    Per-topic breakdown of a result for skill-gap analysis.

    Table: topic_results
        # id: INTEGER (PK)
        # result_id: INTEGER (FK → results)
        # topic_id: INTEGER (FK → topics)
        # scored_marks: INTEGER
        # total_marks: INTEGER
        # accuracy: FLOAT
    """
    pass


class ExamSession:
    """
    Active exam session created when a student enters their secret code.
    Tracks lifecycle: started, active (heartbeat), ended/expired.

    Table: exam_sessions
        # id: INTEGER (PK)
        # attempt_id: INTEGER (FK → attempts)
        # secret_code_id: INTEGER (FK → secret_codes)
        # started_at: TIMESTAMP
        # expires_at: TIMESTAMP
        # ended_at: TIMESTAMP
        # last_heartbeat_at: TIMESTAMP
    """
    pass


class ProctoringEvent:
    """
    Integrity signals during an exam session (tab-switches, heartbeats, etc.).

    Table: proctoring_events
        # id: INTEGER (PK)
        # exam_session_id: INTEGER (FK → exam_sessions)
        # event_type: VARCHAR
        # occurred_at: TIMESTAMP
        # details: JSONB
    """
    pass
