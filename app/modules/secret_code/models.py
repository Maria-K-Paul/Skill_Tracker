"""
app/modules/secret_code/models.py
-----------------------------------
ORM model placeholders for the secret_codes table.

Tables covered: secret_codes.
Column comments match docs/db_schema.md exactly.

SECURITY: code_encrypted stores Fernet-encrypted codes. The plaintext
is NEVER logged, returned to students, or stored unencrypted.

TODO: Add SQLAlchemy Column definitions.
"""


class SecretCode:
    """
    One secret code per student per allocation. One-time use.
    Expires at the end of the slot window.
    Encrypted at rest. NEVER shown to the student.

    Table: secret_codes
        # id: INTEGER (PK)
        # allocation_id: INTEGER (FK → allocations)
        # code_encrypted: VARCHAR
        # is_used: BOOLEAN
        # expires_at: TIMESTAMP
        # used_at: TIMESTAMP
    """
    pass
