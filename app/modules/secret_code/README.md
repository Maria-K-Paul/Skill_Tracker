# Secret Code Module

Manages the generation, storage, and controlled disclosure of per-student exam entry codes.

## Tables
- `secret_codes` — one encrypted code per allocation; one-time use with expiry.

## Security Contract
- Codes are generated using `secrets.token_urlsafe` and encrypted with **Fernet** before storage.
- The plaintext code is **never** stored, logged, or returned to a student endpoint.
- Only admin can reveal a code (via `hall_sheets/` print endpoint).
- Every reveal writes to `audit_log` via `core/audit.write_audit_log()`.
- The code is consumed (marked `is_used=True`) when a student enters it to start an exam.

## Module Interactions
- Called by `allocation/service.run_allocation()` — generates one code per allocation.
- Called by `attempts/service.start_exam()` — verifies and consumes the code.
- Called by `hall_sheets/` router — reveals codes for printing (audited).
