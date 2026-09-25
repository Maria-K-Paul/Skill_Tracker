# DB Schema Reference — Skill Leveling Platform

> This file is the canonical schema reference for all modules.
> Model field comments in each module's `models.py` must match these column names and types exactly.

---

## User & Auth Tables

### users
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| email | VARCHAR |
| password_hash | VARCHAR |
| is_active | BOOLEAN |
| failed_login_count | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

### roles
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| name | VARCHAR |

### user_roles
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| user_id | INTEGER (FK → users) |
| role_id | INTEGER (FK → roles) |

### refresh_tokens
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| user_id | INTEGER (FK → users) |
| token_hash | VARCHAR |
| expires_at | TIMESTAMP |
| revoked | BOOLEAN |
| created_at | TIMESTAMP |

---

## Student & Department Tables

### departments
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| name | VARCHAR |

### academic_years
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| label | VARCHAR |

### students
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| user_id | INTEGER (FK → users) |
| department_id | INTEGER (FK → departments) |
| academic_year_id | INTEGER (FK → academic_years) |
| roll_number | VARCHAR |

### domain_incharge
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| user_id | INTEGER (FK → users) |
| track_id | INTEGER (FK → tracks) |

---

## Domain / Track Tables

### tracks
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| name | VARCHAR |
| description | TEXT |
| is_active | BOOLEAN |

### levels
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| track_id | INTEGER (FK → tracks) |
| level_no | INTEGER |
| name | VARCHAR |
| description | TEXT |

### topics
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| level_id | INTEGER (FK → levels) |
| name | VARCHAR |
| description | TEXT |
| sequence_no | INTEGER |

### subtopics
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| topic_id | INTEGER (FK → topics) |
| name | VARCHAR |
| description | TEXT |
| sequence_no | INTEGER |

---

## Enrollment & Progress Tables

### enrollments
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| student_id | INTEGER (FK → students) |
| track_id | INTEGER (FK → tracks) |
| enrolled_at | TIMESTAMP |
| is_blocked | BOOLEAN |

### level_progress
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| enrollment_id | INTEGER (FK → enrollments) |
| level_id | INTEGER (FK → levels) |
| status | VARCHAR |
| unlocked_at | TIMESTAMP |
| completed_at | TIMESTAMP |

### progression_decisions
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| attempt_id | INTEGER (FK → attempts) |
| result_id | INTEGER (FK → results) |
| decision | VARCHAR |
| decided_at | TIMESTAMP |

---

## Exam & Assessment Tables

### assessments
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| level_id | INTEGER (FK → levels) |
| title | VARCHAR |
| duration_minutes | INTEGER |
| status | VARCHAR |
| created_by | INTEGER (FK → users) |
| created_at | TIMESTAMP |

---

## Slot Tables

### slots
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| assessment_id | INTEGER (FK → assessments) |
| date | DATE |
| start_time | TIME |
| end_time | TIME |
| booking_cutoff | TIMESTAMP |
| status | VARCHAR |

### slot_halls
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| slot_id | INTEGER (FK → slots) |
| hall_id | INTEGER (FK → halls) |

### slot_bookings
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| slot_id | INTEGER (FK → slots) |
| student_id | INTEGER (FK → students) |
| attempt_number | INTEGER |
| booked_at | TIMESTAMP |
| status | VARCHAR |

---

## Hall Tables

### halls
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| name | VARCHAR |
| location | VARCHAR |
| capacity | INTEGER |

---

## Allocation Tables

### allocations
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| slot_booking_id | INTEGER (FK → slot_bookings) |
| hall_id | INTEGER (FK → halls) |
| seat_no | INTEGER |
| allocated_at | TIMESTAMP |

---

## Secret Code Tables

### secret_codes
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| allocation_id | INTEGER (FK → allocations) |
| code_encrypted | VARCHAR |
| is_used | BOOLEAN |
| expires_at | TIMESTAMP |
| used_at | TIMESTAMP |

---

## Attempt & Exam Session Tables

### attempts
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| slot_booking_id | INTEGER (FK → slot_bookings) |
| student_id | INTEGER (FK → students) |
| assessment_id | INTEGER (FK → assessments) |
| attempt_no | INTEGER |
| started_at | TIMESTAMP |
| submitted_at | TIMESTAMP |
| status | VARCHAR |

### exam_sessions
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| attempt_id | INTEGER (FK → attempts) |
| secret_code_id | INTEGER (FK → secret_codes) |
| started_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| ended_at | TIMESTAMP |
| last_heartbeat_at | TIMESTAMP |

### proctoring_events
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| exam_session_id | INTEGER (FK → exam_sessions) |
| event_type | VARCHAR |
| occurred_at | TIMESTAMP |
| details | JSONB |

---

## Question Bank Tables

### questions
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| assessment_id | INTEGER (FK → assessments) |
| topic_id | INTEGER (FK → topics) |
| subtopic_id | INTEGER (FK → subtopics) |
| text | TEXT |
| marks | INTEGER |
| difficulty | VARCHAR |
| explanation | TEXT |

### question_options
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| question_id | INTEGER (FK → questions) |
| text | TEXT |
| is_correct | BOOLEAN |

### attempt_answers
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| attempt_id | INTEGER (FK → attempts) |
| question_id | INTEGER (FK → questions) |
| selected_option_id | INTEGER (FK → question_options) |
| answered_at | TIMESTAMP |

---

## Result Tables

### results
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| attempt_id | INTEGER (FK → attempts) |
| total_marks | INTEGER |
| scored_marks | INTEGER |
| percentage | FLOAT |
| verdict | VARCHAR |
| computed_at | TIMESTAMP |

### topic_results
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| result_id | INTEGER (FK → results) |
| topic_id | INTEGER (FK → topics) |
| scored_marks | INTEGER |
| total_marks | INTEGER |
| accuracy | FLOAT |

---

## Analytics / Summary Tables

### analytics_refresh_jobs
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| job_name | VARCHAR |
| started_at | TIMESTAMP |
| finished_at | TIMESTAMP |
| status | VARCHAR |

### student_performance_summary
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| student_id | INTEGER (FK → students) |
| track_id | INTEGER (FK → tracks) |
| total_attempts | INTEGER |
| passed_levels | INTEGER |
| avg_percentage | FLOAT |
| last_updated | TIMESTAMP |

### domain_performance_summary
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| track_id | INTEGER (FK → tracks) |
| total_students | INTEGER |
| avg_pass_rate | FLOAT |
| last_updated | TIMESTAMP |

### semester_progress_summary
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| student_id | INTEGER (FK → students) |
| academic_year_id | INTEGER (FK → academic_years) |
| levels_completed | INTEGER |
| last_updated | TIMESTAMP |

### topic_gap_summary
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| student_id | INTEGER (FK → students) |
| topic_id | INTEGER (FK → topics) |
| avg_accuracy | FLOAT |
| attempt_count | INTEGER |
| last_updated | TIMESTAMP |

### difficulty_performance_summary
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| student_id | INTEGER (FK → students) |
| difficulty | VARCHAR |
| correct_count | INTEGER |
| total_count | INTEGER |
| last_updated | TIMESTAMP |

### dashboard_widget_cache
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| widget_key | VARCHAR |
| payload | JSONB |
| cached_at | TIMESTAMP |
| expires_at | TIMESTAMP |

---

## Audit Table

### audit_log
| Column | Type |
|---|---|
| id | INTEGER (PK) |
| action | VARCHAR |
| actor_user_id | INTEGER (FK → users) |
| target_user_id | INTEGER (FK → users) |
| details | JSONB |
| ip_address | VARCHAR |
| created_at | TIMESTAMP |
