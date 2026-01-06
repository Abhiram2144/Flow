# Flow Backend

FastAPI-based backend for the Flow personal finance app.

## Architecture

```
backend/
├── api/              → HTTP endpoints (thin routing layer)
├── db/               → SQLAlchemy models & database config
├── models/           → Pydantic schemas (request/response)
├── services/         → Business logic orchestration
├── core/             → Core deterministic logic (momentum calculation)
├── main.py           → App entry point
├── requirements.txt
└── .env.example
```

### Key Principles

- **Core logic in `/core/`**: Pure Python functions, no database or HTTP concerns
- **Services layer**: Orchestrates DB access and calls core logic
- **Thin API routes**: Receive request → call service → return response
- **Deterministic**: No black-box ML or LLM decision-making
- **Explainable**: All calculations can be inspected and understood

## Setup

### 1. Create virtual environment

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings (especially SECRET_KEY)
```

### 4. Run server

```bash
python main.py
```

Server starts at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

## API Endpoints

### Auth

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Budget

- `POST /budget` - Create/update budget for current month
- `GET /budget/current` - Get current month's budget

### Transactions

- `POST /transactions` - Create transaction
- `GET /transactions?month=YYYY-MM` - List transactions for month

### Bank Statement

- `POST /bank-statement/upload` - Upload CSV file

CSV format (header required):
```csv
date,amount,merchant
2024-01-15,45.50,Whole Foods
2024-01-16,12.00,Gas Station
```

### Momentum

- `GET /momentum/current` - Get current financial momentum

Response:
```json
{
  "month": "2024-01",
  "momentum": {
    "budget_amount": 2000.00,
    "total_spent": 1250.00,
    "remaining": 750.00,
    "expected_daily": 48.39,
    "recent_daily": 52.14,
    "runway_drift": 3.75,
    "buffer_days_lost": 1.2,
    "confidence": "high"
  },
  "advice": "You're tracking slightly above your daily target with days remaining."
}
```

### Advice

- `GET /advice/current` - Get single sentence of financial advice

Response:
```json
{
  "month": "2024-01",
  "advice": "You're tracking slightly above your daily target with days remaining."
}
```

## Database

Uses SQLite (`flow.db`) for simplicity and local-first operation.

Tables:
- `users` - User accounts
- `budgets` - Monthly budgets
- `transactions` - User transactions (manual or bank)
- `bank_transactions` - Historical bank statement data

## Momentum Calculation

Core logic in [`core/momentum.py`](./core/momentum.py).

Inputs:
- Monthly budget
- Total spent this month
- Recent daily spend (last 14 days)
- Days remaining in month

Outputs:
- `remaining`: Budget left
- `expected_daily`: Daily spend needed to finish on budget
- `recent_daily`: Average daily spend (last 14 days)
- `runway_drift`: How much over/under expected daily
- `buffer_days_lost`: Days of budget lost per day of drift
- `confidence`: Based on data quality (high/medium/low)

The narrative is generated deterministically (fallback) or by LLM given only the structured momentum data.

## Development

### Run tests

```bash
pytest
```

### Linting

```bash
ruff check .
black --check .
```

### Type checking

```bash
mypy .
```

## Design Constraints

✅ **DO**:
- Keep logic deterministic and explainable
- Store raw transaction data
- Let current data override patterns
- Use services layer for orchestration
- Keep API routes thin

❌ **DON'T**:
- Use black-box ML for decisions
- Let LLM influence transaction logic
- Enforce budgets based only on history
- Store calculations as truth
- Add features beyond the MVP spec

## Future Enhancements

- LLM integration for narrative generation
- Lightweight ML for spending clustering/anomalies
- Receipt OCR support
- Budget recommendations (data-driven, not ML-driven)
- Multi-currency support
