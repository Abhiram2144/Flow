"""
Bank statement import endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import csv
from io import StringIO

from db import get_db
from db.models import User
from models.schemas import BankStatementRow
from services import BankStatementService
from api.auth import get_current_user

router = APIRouter(prefix="/bank-statement", tags=["bank-statement"])


@router.post("/upload")
def upload_bank_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload bank statement CSV.
    
    Expected CSV format:
    date,amount,merchant,category
    2024-01-15,45.50,Whole Foods,groceries
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be CSV format")

    try:
        content = file.file.read().decode("utf-8")
        reader = csv.DictReader(StringIO(content))

        rows = []
        for row_dict in reader:
            try:
                row = BankStatementRow(
                    date=row_dict["date"],
                    amount=float(row_dict["amount"]),
                    merchant=row_dict["merchant"],
                    category=row_dict.get("category"),
                )
                rows.append(row)
            except (KeyError, ValueError) as e:
                # Skip malformed rows
                continue

        # Import
        count = BankStatementService.import_bank_statement(
            db=db,
            user_id=current_user.id,
            rows=rows,
        )

        return {
            "message": f"Imported {count} transactions",
            "imported": count,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")
