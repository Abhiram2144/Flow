# Development Guide for Flow

## Project Structure

```
Flow/
├── backend/              # FastAPI backend
│   ├── main.py          # App entry point
│   ├── core/
│   │   ├── models.py    # Data models
│   │   ├── engines.py   # Core business logic engines
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── pyproject.toml
│   └── .gitignore
│
├── mobile/              # Expo React Native app
│   ├── App.tsx          # Root component
│   ├── app.json         # Expo config
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── types/
│   │   │   └── api.ts   # API type definitions
│   │   ├── utils/
│   │   │   └── api.ts   # API client
│   │   ├── store/
│   │   │   └── useAppStore.ts  # Global state (Zustand)
│   │   └── screens/
│   │       └── DashboardScreen.tsx  # Main UI
│   └── .gitignore
│
├── README.md            # Project overview
├── DEVELOPMENT.md       # This file
└── .gitignore          # Root .gitignore
```

## Getting Started

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run the server:**
   ```bash
   python main.py
   # Or with uvicorn directly:
   uvicorn main:app --reload
   ```

   Server will be available at `http://localhost:8000`

### Mobile Setup

1. **Navigate to mobile folder:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Expo:**
   ```bash
   npm start
   # Then:
   # - Press 'a' for Android
   # - Press 'i' for iOS
   # - Press 'w' for web
   ```

## Core Concepts

### Engines

Flow's logic is split into focused, composable engines:

1. **TransactionNormalizer** - Converts all inputs (bank, manual, receipt) to unified model
2. **MerchantPatternEngine** - Builds merchant profiles and detects recurrence
3. **NeedFulfillmentEngine** - Determines if needs are satisfied
4. **MomentumEngine** - Computes momentum score
5. **WeatherMapper** - Converts score to weather state

Each engine:
- Has a clear, single responsibility
- Takes explicit inputs
- Returns explicit outputs
- Contains NO black-box logic

### Data Flow

```
Transactions (bank, manual, receipt)
        ↓
TransactionNormalizer
        ↓
MerchantPatternEngine
        ↓
NeedFulfillmentEngine
        ↓
MomentumEngine
        ↓
ExplainabilityContextBuilder
        ↓
WeatherMapper
        ↓
LLM (narrative only)
        ↓
Mobile App (pure UI)
```

## Key Design Constraints

✅ **DO**:
- Keep engines small and focused
- Make all logic explainable and deterministic
- Use historical data ONLY to suggest baselines
- Let current data always override patterns
- Build merchant profiles from transaction history
- Use rules + light ML for patterns (not decisions)
- Use LLM ONLY for narrative generation
- Keep mobile app purely reactive

❌ **DON'T**:
- Use black-box ML for decision-making
- Let LLM influence transaction classification
- Enforce budgets based on historical patterns
- Add business logic to mobile UI
- Build complex predictive models
- Make judgmental statements to users
- Make sudden UI state changes (smooth transitions)

## API Endpoints (To Be Implemented)

### Health & Info
- `GET /` - API info
- `GET /health` - Health check

### Transactions
- `POST /api/v1/transactions` - Create transaction
- `POST /api/v1/transactions/receipt` - Upload receipt
- `GET /api/v1/transactions` - List transactions

### Momentum & Explanations
- `GET /api/v1/momentum` - Get current momentum state
- `GET /api/v1/merchants/{name}` - Get merchant profile
- `GET /api/v1/needs` - Get all needs

## Testing

### Backend
```bash
cd backend
pytest
```

### Mobile
```bash
cd mobile
npm test
```

## Deployment

### Backend
- Can be deployed to: Heroku, AWS, GCP, DigitalOcean, etc.
- Requires: Python 3.10+, FastAPI, uvicorn
- Environment: `.env` file with SECRET_KEY, database URLs, etc.

### Mobile
- Use EAS (Expo Application Services) for builds
- Or build locally with Android Studio / Xcode

## Contributing

1. Follow the coding style preferences (clear, modular, explicit)
2. Keep engines focused (single responsibility)
3. Write tests for new features
4. Update documentation
5. Follow the design constraints

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Next Steps:**
1. Implement the API endpoints
2. Add database models (SQLAlchemy)
3. Create route handlers
4. Add OCR for receipt parsing
5. Implement ML utilities (clustering, anomaly detection)
6. Add LLM integration
7. Build more mobile screens
