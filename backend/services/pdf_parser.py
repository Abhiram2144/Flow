"""
PDF to CSV normalization for bank statements.

STRICT PREPROCESSING STEP - deterministic, rule-based, explainable.
"""

import pdfplumber
import re
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class BankStatementParser:
    """Parse bank statement PDF to normalized CSV format."""

    # Keywords to exclude (credits, balances, metadata)
    EXCLUDE_KEYWORDS = [
        "CR",
        "CREDIT",
        "BALANCE BROUGHT FORWARD",
        "BALANCE CARRIED FORWARD",
        "OPENING BALANCE",
        "CLOSING BALANCE",
        "BALANCE",
        "BROUGHT FORWARD",
        "CARRIED FORWARD",
        "INTEREST",
        "OVERDRAFT",
        "STATEMENT",
        "ACCOUNT NUMBER",
        "ACCOUNT",
        "SORT CODE",
        "HSBC",
    ]

    @staticmethod
    def parse_pdf_to_csv(pdf_bytes: bytes) -> str:
        """
        Convert bank statement PDF to CSV string.
        
        ERROR HANDLING (DETERMINISTIC):
        - Unreadable PDF: Return empty CSV (header only)
        - No transactions: Return empty CSV (header only)
        - Malformed rows: Skip, continue processing
        - No date range detected: Process all valid rows
        
        FILTERING:
        - Transactions filtered to "last month" where possible
        - If no clear date range, all valid rows accepted
        
        Args:
            pdf_bytes: Raw PDF file bytes
            
        Returns:
            CSV string with format: date,amount,merchant
            Returns header-only if parsing fails or no transactions found
        """
        try:
            with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                if len(pdf.pages) == 0:
                    # Empty PDF
                    logger.warning("PDF has no pages")
                    return "date,amount,merchant"

                # Extract all text from PDF
                full_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"

                if not full_text.strip():
                    # No readable text
                    logger.warning("PDF contains no readable text")
                    return "date,amount,merchant"

                logger.info(f"Extracted {len(full_text)} chars from PDF")

                # Parse transactions
                transactions = BankStatementParser._extract_transactions(full_text)
                logger.info(f"Found {len(transactions)} initial transactions")

                if not transactions:
                    # No transactions found
                    logger.warning("No transactions matched in PDF text")
                    return "date,amount,merchant"

                # Filter to last month only
                transactions = BankStatementParser._filter_to_statement_period(transactions)
                logger.info(f"After filtering: {len(transactions)} transactions")

                if not transactions:
                    # All filtered out
                    logger.warning("All transactions filtered out")
                    return "date,amount,merchant"

                # Convert to CSV
                csv_lines = ["date,amount,merchant"]
                for date, amount, merchant in transactions:
                    csv_lines.append(f"{date},{amount},{merchant}")

                return "\n".join(csv_lines)

        except Exception as e:
            logger.error(f"PDF parsing failed: {str(e)}", exc_info=True)
            # Graceful failure - return empty CSV
            return "date,amount,merchant"

    @staticmethod
    def _extract_transactions(text: str) -> List[Tuple[str, float, str]]:
        """
        Extract transaction rows from PDF text.
        
        STATE-BASED PARSER for HSBC multi-line statements.
        
        State machine:
        1. Detect date → set current_date
        2. Detect debit marker (VIS, BP, OBP, CARD, CONTACTLESS, ))) → finalize previous, start new transaction
        3. Detect amount → finalize current transaction
        4. Accumulate merchant lines between markers
        
        Returns:
            List of (date, amount, merchant) tuples
        """
        transactions = []
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        current_date = None
        current_merchant_lines = []

        # Patterns
        date_pattern = re.compile(r"\b(\d{2}\s+[A-Za-z]{3}\s+\d{2})\b")  # 27 Oct 25
        debit_marker_pattern = re.compile(r"^(VIS|BP|OBP|CARD|CONTACTLESS|\)\)\))\s*(.+)")  # Debit prefixes or )))
        amount_pattern = re.compile(r"\b(\d+\.\d{2})\b")  # Standalone amount
        
        def finalize_transaction():
            """Finalize current transaction if complete."""
            nonlocal current_date, current_merchant_lines
            
            if current_date and current_merchant_lines:
                merchant = " ".join(current_merchant_lines)
                merchant = BankStatementParser._clean_merchant(merchant)
                if merchant:
                    # Return (date, merchant, lines) - amount will be extracted later
                    return (current_date, merchant)
            return None

        pending_transaction = None  # (date, merchant) waiting for amount

        for line in lines:
            # Skip noise
            if BankStatementParser._should_exclude(line):
                continue

            # 1️⃣ Detect date
            date_match = date_pattern.search(line)
            if date_match:
                current_date = BankStatementParser._normalize_date_hsbc(date_match.group(1))
                # Don't reset merchant - date can appear inline with merchant
                
                # Check if this line also has a debit marker
                remainder = line[date_match.end():].strip()
                if remainder:
                    marker_match = debit_marker_pattern.match(remainder)
                    if marker_match:
                        # Line has both date and marker - process the marker part
                        marker_merchant = BankStatementParser._clean_merchant(marker_match.group(2))
                        if marker_merchant:
                            current_merchant_lines = [marker_merchant]
                    else:
                        # Line has date and other text - accumulate if transaction active
                        if remainder and current_merchant_lines:
                            current_merchant_lines.append(remainder)
                continue

            # 2️⃣ Detect debit marker (transaction boundary)
            marker_match = debit_marker_pattern.match(line)
            if marker_match:
                # Finalize previous transaction first
                if pending_transaction:
                    # We have a pending transaction but no amount yet - skip it
                    pending_transaction = None
                
                # Start new transaction
                marker_merchant = BankStatementParser._clean_merchant(marker_match.group(2))
                if marker_merchant:
                    current_merchant_lines = [marker_merchant]
                continue

            # 3️⃣ Detect amount (finalize transaction)
            amount_match = amount_pattern.search(line)
            if amount_match and current_date and current_merchant_lines:
                amount_str = amount_match.group(1)
                amount = float(amount_str)
                
                # Exclude CR (credit) transactions
                if "CR" not in line and amount > 0:
                    merchant = " ".join(current_merchant_lines)
                    merchant = BankStatementParser._clean_merchant(merchant)
                    
                    if merchant:
                        transactions.append((current_date, amount, merchant))
                
                # Reset merchant for next transaction
                current_merchant_lines = []
                continue

            # 4️⃣ Accumulate merchant lines
            if current_date and current_merchant_lines:
                current_merchant_lines.append(line)

        # Sort by date ascending
        transactions.sort(key=lambda x: x[0])
        return transactions

    @staticmethod
    def _filter_to_statement_period(transactions: List[Tuple[str, float, str]]) -> List[Tuple[str, float, str]]:
        """
        Filter transactions to statement period (typically last month).
        
        LOGIC:
        - Detect date range from transaction dates
        - Accept transactions within detected range
        - If range is ambiguous, accept all transactions
        
        Returns:
            Filtered list of (date, amount, merchant) tuples
        """
        if not transactions:
            return []

        # Extract dates
        dates = [datetime.strptime(t[0], "%Y-%m-%d").date() for t in transactions]
        min_date = min(dates)
        max_date = max(dates)

        # If date range is very large (> 45 days), assume it spans multiple months
        # Filter to the LAST MONTH within the range
        date_range = (max_date - min_date).days

        if date_range > 45:
            # Likely statement covers multiple months
            # Use last 30-35 days only
            cutoff_date = max_date - timedelta(days=32)
            transactions = [
                t for t in transactions
                if datetime.strptime(t[0], "%Y-%m-%d").date() >= cutoff_date
            ]

        return transactions

    @staticmethod
    def _should_exclude(line: str) -> bool:
        """Check if line should be excluded."""
        line_upper = line.upper()
        for keyword in BankStatementParser.EXCLUDE_KEYWORDS:
            if keyword in line_upper:
                return True
        return False

    @staticmethod
    def _parse_transaction_line(line: str) -> Optional[Tuple[str, float, str]]:
        """
        Parse a single transaction line.
        
        Returns:
            (date, amount, merchant) or None if not a valid transaction
        """
        # Common date patterns
        date_patterns = [
            r"\b(\d{2}[-/]\d{2}[-/]\d{4})\b",  # DD-MM-YYYY or DD/MM/YYYY
            r"\b(\d{4}[-/]\d{2}[-/]\d{2})\b",  # YYYY-MM-DD or YYYY/MM/DD
            r"\b(\d{2}\s+[A-Za-z]{3}\s+\d{4})\b",  # DD MMM YYYY
            r"\b(\d{1,2}\s+[A-Za-z]+\s+\d{4})\b",  # D Month YYYY
        ]

        # Amount patterns (with currency symbols)
        amount_patterns = [
            r"[£$€]\s*(\d+[,.]?\d*\.\d{2})",  # £45.50
            r"(\d+[,.]?\d*\.\d{2})\s*[£$€]",  # 45.50£
            r"(\d+[,.]?\d*\.\d{2})\s+DR",     # 45.50 DR (debit)
            r"(\d+[,.]?\d*\.\d{2})(?!\s*CR)",  # 45.50 (not followed by CR)
        ]

        # Try to find date
        date_str = None
        date_match = None
        for pattern in date_patterns:
            match = re.search(pattern, line)
            if match:
                date_str = match.group(1)
                date_match = match
                break

        if not date_str:
            return None

        # Try to find amount
        amount = None
        amount_match = None
        for pattern in amount_patterns:
            match = re.search(pattern, line)
            if match:
                amount_str = match.group(1).replace(",", "").replace(" ", "")
                try:
                    amount = float(amount_str)
                    amount_match = match
                    break
                except ValueError:
                    continue

        if not amount or amount <= 0:
            return None

        # Extract merchant (text between date and amount, or after)
        # Remove date and amount from line to get merchant
        merchant = line
        if date_match:
            merchant = merchant.replace(date_match.group(0), "", 1)
        if amount_match:
            merchant = merchant.replace(amount_match.group(0), "", 1)

        # Clean merchant
        merchant = BankStatementParser._clean_merchant(merchant)

        if not merchant:
            return None

        # Normalize date to ISO format
        iso_date = BankStatementParser._normalize_date(date_str)
        if not iso_date:
            return None

        return (iso_date, amount, merchant)

    @staticmethod
    def _clean_merchant(text: str) -> str:
        """Clean merchant description."""
        # Remove extra whitespace
        text = " ".join(text.split())
        # Remove currency symbols
        text = re.sub(r"[£$€]", "", text)
        # Remove DR/CR markers
        text = re.sub(r"\b(DR|CR)\b", "", text)
        # Trim
        text = text.strip()
        return text

    @staticmethod
    def _normalize_date(date_str: str) -> Optional[str]:
        """
        Convert various date formats to ISO (YYYY-MM-DD).
        """
        date_formats = [
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y-%m-%d",
            "%Y/%m/%d",
            "%d %b %Y",
            "%d %B %Y",
        ]

        for fmt in date_formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

        return None

    @staticmethod
    def _normalize_date_hsbc(date_str: str) -> Optional[str]:
        """
        Convert HSBC date format to ISO (YYYY-MM-DD).
        HSBC format: '27 Oct 25' (DD MMM YY)
        """
        try:
            # Parse with 2-digit year
            dt = datetime.strptime(date_str, "%d %b %y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            return None
