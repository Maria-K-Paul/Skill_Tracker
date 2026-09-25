"""
app/modules/ai_engine/models.py
---------------------------------
ORM model placeholders for the AI-generated question bank.

Tables covered: questions, question_options.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship from Question to QuestionOption list.
"""


class Question:
    """
    A question in the question bank. Generated from topic/subtopic text by the AI engine.
    Must pass question_validator before being persisted.

    Table: questions
        # id: INTEGER (PK)
        # assessment_id: INTEGER (FK → assessments)
        # topic_id: INTEGER (FK → topics)
        # subtopic_id: INTEGER (FK → subtopics)
        # text: TEXT
        # marks: INTEGER
        # difficulty: VARCHAR
        # explanation: TEXT
    """
    pass


class QuestionOption:
    """
    One option for a multiple-choice question.

    Table: question_options
        # id: INTEGER (PK)
        # question_id: INTEGER (FK → questions)
        # text: TEXT
        # is_correct: BOOLEAN
    """
    pass
