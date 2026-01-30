from fastapi import FastAPI, UploadFile, File as FastAPIFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from services import parser, trainer, predictor
import shutil

DATA_PATH = "data/transactions.csv"
MODEL_PATH = "models/spending_model.pkl"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "Flow backend running"}

@app.post("/parse-statement")
def parse_statement(file: UploadFile = FastAPIFile(...)):
    pdf_bytes = file.file.read()
    transactions = parser.parse_pdf_to_transactions(pdf_bytes)
    # Optionally append to CSV
    if transactions:
        os.makedirs("data", exist_ok=True)
        df = pd.DataFrame(transactions)
        if os.path.exists(DATA_PATH):
            df.to_csv(DATA_PATH, mode="a", header=False, index=False)
        else:
            df.to_csv(DATA_PATH, index=False)
    return transactions

@app.post("/train")
def train():
    if not os.path.exists(DATA_PATH):
        return JSONResponse(status_code=400, content={"error": "No transaction data found"})
    model = trainer.train_model(DATA_PATH, MODEL_PATH)
    return {"status": "trained", "model_path": MODEL_PATH}

@app.post("/predict")
def predict(transactions: list):
    if not os.path.exists(MODEL_PATH):
        return JSONResponse(status_code=400, content={"error": "Model not trained"})
    result = predictor.predict_spending(transactions, MODEL_PATH)
    return result
