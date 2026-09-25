# AI Engine Module

Generates exam questions for the question bank using LLM inference on topic/subtopic text.

## Key Design Principles
- **No source documents** — questions are generated from `topic.name`, `topic.description`, `subtopic.name`, `subtopic.description` only.
- Output must pass `question_validator.py` before being stored.
- Target difficulty is computed from the student's historical accuracy (`difficulty.py`).

## Difficulty Rules
| Accuracy | Target Difficulty |
|---|---|
| > 80% | hard |
| 50% – 80% | medium |
| < 50% | easy |
| No data (first attempt) | medium |

## File Layout (non-standard)
```
ai_engine/
├── __init__.py
├── router.py
├── models.py              # Question, QuestionOption placeholders
├── question_generator.py  # Orchestrates the full generation pipeline
├── difficulty.py          # Accuracy → difficulty mapping
├── skill_gap.py           # Weak-topic detection
├── question_validator.py  # Output validation before DB persist
├── llm_client.py          # Pluggable LLM adapter
├── prompts/               # Prompt templates (.gitkeep placeholder)
├── README.md
└── tests/
```

## Module Interactions
- Reads topic/subtopic content via `domains/service` (name + description only).
- Reads student accuracy from `analytics` summary tables (via service layer).
- Persists to `Question` / `QuestionOption` tables in this module.
