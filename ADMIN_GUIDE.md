# Admin Quick Reference Guide

## ✅ Confirmed: Database Connection

**Your data IS saved to Neon Database (Cloud)**
- Database URL: `postgresql+asyncpg://...@ep-icy-violet-b48t23ir-pooler.c-6.us-east-2.aws.neon.tech/neondb`
- ✅ Successfully tested: Student creation works and saves to Neon
- ✅ All user accounts, slots, bookings are stored in Neon cloud database
- ❌ NOT using local SQLite database

---

## Admin Login Credentials

**Email:** `admin@college.edu`  
**Password:** `admin123`

---

## Features Available

### 1. Add Users (`/admin/create-accounts`)
**Create Student Accounts:**
- Username (required)
- Email (required)
- Full Name (required)
- Password (required) - Must be at least 8 characters
- Department (required)
- Current Semester (1-10, required)
- Registration Number (required)
- Roll Number (optional)
- Account Expiration Date (optional)

**Create Domain Incharge (Staff):**
- Username, Email, Full Name (required)
- Roles: Admin, Domain Owners (select at least one)
- Employee ID (optional)
- System generates temporary password (shown once)

### 2. Account Status (`/admin/account-status`)
- View all user accounts
- Filter by: Status (Active/Inactive), Role, Search
- **Deactivate** accounts (blocks login, logs out user)
- **Activate** accounts (re-enables login)
- **Unlock** accounts (clears failed login attempts)
- See expired accounts with warning badges

### 3. Slot Management (`/admin/slots`)
**Create Slot:**
- Select Assessment/Level
- Set Date & Time (start and end)
- Set Booking Cutoff date/time
- Select multiple Halls/Venues
- Shows total capacity

**Manage Slots:**
- View all created slots
- See bookings per slot
- Run Allocation (randomly assigns students to halls)
- Download hall-specific PDF sheets with secret codes

---

## Common Issues & Solutions

### ❌ "Failed to create student account"
**Solution:** Check the error message displayed. Common issues:
- Username or email already exists
- Password too short (minimum 8 characters)
- Missing required fields
- Department ID doesn't exist

### ❌ Slot Management shows white/empty screen
**Solution:** (FIXED)
- Page now shows loading spinner
- If no halls: Message "No halls available"
- If no assessments: Message "No assessments available"
- You need to create halls and assessments first before creating slots

### ❌ Account shows as EXPIRED
**Solution:**
- Go to Account Status page
- The account has passed its expiration date
- User cannot login even if account is active
- Contact system admin to extend expiration date

---

## Workflow: Complete Exam Setup

1. **Create Halls** (if not exist)
   - Go to Halls management
   - Add hall name, location, capacity

2. **Create Assessments/Levels** (if not exist)
   - Go to assessment management
   - Create exam for specific level

3. **Create Slot**
   - Go to Slot Management → Create Slot
   - Select assessment, set date/time
   - Select halls (multiple allowed)
   - Set booking cutoff

4. **Students Book Slots**
   - Students see only the DATE (not time/hall)
   - They book by clicking on available dates

5. **After Booking Cutoff**
   - Go to Slot Management → Manage Slots
   - Click "Run Allocation" for the slot
   - System randomly assigns students to halls
   - Generates secret codes (encrypted)

6. **Download Hall Sheets**
   - Click individual "Download" buttons per hall
   - PDF contains: Students, Seat Numbers, Secret Codes
   - Print and give to invigilators

7. **Exam Day**
   - Invigilators hand out secret codes physically
   - Students use codes to start exams

---

## Security Notes

✅ **Passwords are hashed** (bcrypt)  
✅ **Secret codes are encrypted** (Fernet)  
✅ **Every code reveal is audit-logged**  
✅ **Failed login attempts tracked** (locks after 5 attempts)  
✅ **Account expiration enforced** at login  
✅ **Sessions invalidated** when account deactivated

---

## Support

- **View Audit Logs:** `/admin/audit` - See all admin actions
- **Analytics:** `/admin/analytics` - System-wide statistics
- **Settings:** `/admin/settings` - System configuration

---

**Generated:** 2026-10-01  
**System:** Skill Leveling Platform  
**Database:** Neon PostgreSQL (Cloud)
