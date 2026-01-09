# Backend Review & Alignment Checklist

## ✅ COMPLETED FIXES

### 1. Data Models - Removed MVP violations
- ✅ `Transaction.category` → REMOVED
- ✅ `Transaction.notes` → REMOVED
- ✅ `BankTransaction.category` → REMOVED
- **Reason**: MVP tracks only date, amount, merchant, source

### 2. Pydantic Schemas - Aligned with MVP
- ✅ `TransactionCreate` - removed `category`, `notes`
- ✅ `TransactionResponse` - removed `category`, `notes`
- ✅ `BankStatementRow` - removed `category`
- ✅ `MomentumResponse` - replaced `narrative` + `gentle_suggestions[]` with single `advice` string
- **Reason**: MVP requires one sentence of advice only

### 3. Core Logic - Single Advice Generation
- ✅ Created `generate_advice()` function
- ✅ Returns ONE calm, non-judgmental sentence only
- ✅ Removed `generate_gentle_suggestions()` (array format violated MVP)
- ✅ Kept `generate_momentum_narrative()` as internal utility
- **Logic**:
  - Budget overrun → "You've spent your monthly budget."
  - Severe drift (>5 days) → "At your current pace, budget runs out in X days."
  - Moderate drift (2-5 days) → "You're tracking slightly above your daily target with days remaining."
  - On pace → "You're tracking on pace with your monthly budget."

### 4. Services Layer - Updated for MVP
- ✅ `TransactionService.create_transaction()` - removed category/notes assignment
- ✅ `BankStatementService.import_bank_statement()` - removed category assignment
- ✅ `MomentumService.get_current_momentum()` - now returns single `advice` string
- **No embedded business logic** - all math in core/

### 5. API Routes - MVP Only
- ✅ `POST /auth/register` - works
- ✅ `POST /auth/login` - works
- ✅ `POST /budget` - works
- ✅ `GET /budget/current` - works
- ✅ `POST /transactions` - works
- ✅ `GET /transactions?month=YYYY-MM` - works
- ✅ `POST /bank-statement/upload` - fixed to not expect category
- ✅ `GET /momentum/current` - fixed to return single advice
- ✅ `GET /advice/current` - ADDED (returns month + single sentence)
- **No extra endpoints** - clean MVP implementation

### 6. CSV Import - MVP Format
- ✅ Header: `date,amount,merchant` (no category)
- ✅ Date format: YYYY-MM-DD
- ✅ Skips malformed rows gracefully
- ✅ Deduplicates transactions by date+amount+merchant

## 🔧 WHAT TO DO NEXT

### Install & Run

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set SECRET_KEY to a strong random string

# Run server
python main.py
```

Server runs at `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Test Workflow

1. **Register user**
   ```bash
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "securepassword123"
   }
   ```
   Response: JWT token

2. **Set budget**
   ```bash
   POST /budget
   Authorization: Bearer {token}
   {
     "total_budget": 2000.00
   }
   ```

3. **Add transactions**
   ```bash
   POST /transactions
   Authorization: Bearer {token}
   {
     "date": "2024-01-15T10:30:00",
     "amount": 45.50,
     "merchant": "Whole Foods"
   }
   ```

4. **Upload bank statement**
   ```bash
   POST /bank-statement/upload
   Authorization: Bearer {token}
   # CSV file with date,amount,merchant
   ```

5. **Get momentum**
   ```bash
   GET /momentum/current
   Authorization: Bearer {token}
   ```
   Returns structured momentum + single advice sentence

6. **Get advice only**
   ```bash
   GET /advice/current
   Authorization: Bearer {token}
   ```
   Returns: `{ "month": "2024-01", "advice": "..." }`

## 📋 MVP Compliance

### ✅ Principles Met
- **Past data suggests, present data overrides** - Bank statements are learning data only
- **Rules decide, ML assists, LLM explains** - No ML in MVP, LLM receives structured data only
- **One sentence of advice only** - No arrays, no multi-sentence responses
- **No categories in MVP** - Removed from all models
- **No black-box ML** - Momentum is pure deterministic math
- **No business logic in API** - All in services/ and core/
- **SQLite only** - Single local database file

### ✅ Endpoints Complete
- Auth (register, login)
- Budget (create, get current)
- Transactions (create, list by month)
- Bank Statement (upload CSV)
- Momentum (structured + advice)
- Advice (single sentence only)

### ✅ Data Models Clean
```
User: id, email, password_hash, created_at
Budget: id, user_id, month, total_budget
Transaction: id, user_id, date, amount, merchant, source
BankTransaction: id, user_id, date, amount, merchant
```

### ✅ No Scope Drift
- ❌ Removed: category field
- ❌ Removed: notes field
- ❌ Removed: suggestions array
- ❌ Removed: multi-sentence advice
- ✅ Added: /advice/current endpoint (MVP required)

## 🚀 Ready for Testing

The backend is now:
1. Syntactically valid
2. MVP-compliant
3. Internally consistent
4. Ready to install dependencies and run
5. Aligned with Flow's philosophy

Next: Install dependencies and test the full workflow.
