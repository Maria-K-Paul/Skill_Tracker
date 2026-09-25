"""
app/modules/secret_code/service.py
------------------------------------
One code per student, one-time use, encrypted at rest (code_encrypted).
Readable ONLY by admin via hall_sheets. Never returned to a student endpoint.
Every reveal writes to core/audit.py AuditLog.

Cross-module calls:
- core/security.encrypt_code() / decrypt_code() — for encryption.
- core/audit.write_audit_log() — every reveal is audited.
- Called by allocation/service.run_allocation() to generate codes.
- Called by attempts/service.start_exam() to verify and consume a code.
- No direct import of other modules' models.py or router.py.

TODO: implement generate_code_for_student(allocation_id, expires_at) → SecretCode
      - generate a random alphanumeric code (use secrets.token_urlsafe)
      - encrypt with core/security.encrypt_code()
      - store encrypted value; NEVER store plaintext
TODO: implement verify_and_consume_code(plain_code, allocation_id) → bool
      - decrypt stored code, compare
      - if match and not expired and not used: mark is_used=True, set used_at
      - return True on success
TODO: implement reveal_code_for_admin(allocation_id, actor_user_id, ip) → str
      - decrypt code
      - write audit log entry via core/audit.write_audit_log()
      - return plaintext ONLY to admin caller; never cache or re-expose
TODO: implement expire_unused_codes() — batch mark codes as used=False for absent students
"""
import secrets as _secrets


async def generate_code_for_student(allocation_id: int, expires_at) -> dict:
    """
    Generate, encrypt, and persist a secret code for a given allocation.
    Called by allocation/service — never by a student-facing endpoint.

    TODO: use _secrets.token_urlsafe(16), encrypt, insert SecretCode.
    """
    pass


async def verify_and_consume_code(plain_code: str, allocation_id: int) -> bool:
    """
    Verify a student-entered code against the stored encrypted value.
    Marks the code as used on success.

    TODO: decrypt, compare, update is_used + used_at.
    """
    return False


async def reveal_code_for_admin(
    allocation_id: int, actor_user_id: int, ip_address: str
) -> str:
    """
    Decrypt and return the plaintext code. Admin only.
    Writes an audit log entry via core/audit.write_audit_log().

    TODO: decrypt, audit, return string.
    """
    pass
