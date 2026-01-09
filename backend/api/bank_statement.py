"""
Bank statement import endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import csv
import logging
from io import StringIO

from db import get_db
from db.models import User
from models.schemas import BankStatementRow
from services import BankStatementService
from services.pdf_parser import BankStatementParser
from api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bank-statement", tags=["bank-statement"])


@router.post("/upload")
def upload_bank_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload bank statement (CSV or PDF).
    
    RE-UPLOAD POLICY:
    - New upload replaces old profile (re-bootstrap)
    - Manual transactions are never deleted
    - Allows user to correct mistakes or update data
    
    ERROR HANDLING:
    - Unreadable PDF: Returns 400 with message "PDF could not be read"
    - No transactions parsed: Returns 400 with message "No transactions found in file"
    - No valid dates: Returns 400 with message "No valid dates detected"
    - CSV format error: Returns 400 with message "CSV format invalid"
    - Partial success: Returns 200 with count of imported transactions
    
    CSV format (header required):
    date,amount,merchant
    2024-01-15,45.50,Whole Foods
    2024-01-16,12.00,Gas Station
    
    PDF format:
    Any bank statement PDF - will be normalized to CSV
    """
    try:
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Read file content
        try:
            content_bytes = file.file.read()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

        if not content_bytes:
            raise HTTPException(status_code=400, detail="File is empty")

        # Determine file type and parse
        try:
            if file.filename.endswith(".pdf"):
                # Parse PDF to CSV
                csv_string = BankStatementParser.parse_pdf_to_csv(content_bytes)
                if csv_string.strip() == "date,amount,merchant":
                    # No transactions were parsed
                    logger.warning(f"PDF parsing failed - no transactions extracted from {file.filename}")
                    raise HTTPException(
                        status_code=400,
                        detail="PDF could not be read or contains no transactions. Please ensure the file is a valid bank statement with transaction dates, amounts, and merchant names."
                    )
                content = csv_string
            elif file.filename.endswith(".csv"):
                # Use CSV directly
                content = content_bytes.decode("utf-8")
            else:
                raise HTTPException(status_code=400, detail="File must be CSV or PDF format")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File parsing error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

        # Parse CSV
        try:
            reader = csv.DictReader(StringIO(content))
            
            if not reader.fieldnames or "date" not in reader.fieldnames or "amount" not in reader.fieldnames:
                raise HTTPException(
                    status_code=400,
                    detail="CSV must have columns: date, amount, merchant"
                )

            rows = []
            valid_count = 0
            for row_dict in reader:
                try:
                    row = BankStatementRow(
                        date=row_dict["date"],
                        amount=float(row_dict["amount"]),
                        merchant=row_dict.get("merchant", "Unknown"),
                    )
                    rows.append(row)
                    valid_count += 1
                except (KeyError, ValueError) as e:
                    # Skip malformed rows
                    continue

            if valid_count == 0:
                raise HTTPException(status_code=400, detail="No valid transactions found in file")

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")

        # Import
        try:
            count = BankStatementService.import_bank_statement(
                db=db,
                user_id=current_user.id,
                rows=rows,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        if count == 0:
            raise HTTPException(status_code=400, detail="No new transactions to import (possible duplicates)")

        return {
            "message": f"Imported {count} transactions",
            "imported": count,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unexpected error: {str(e)}")


@router.get("/check")
def check_bank_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if user has uploaded bank statement data."""
    has_data = BankStatementService.has_bank_data(db, current_user.id)
    return {"has_bank_data": has_data}
