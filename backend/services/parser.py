import pdfplumber
import re
from typing import List, Dict
from datetime import datetime

EXCLUDE_KEYWORDS = [
    "CR", "CREDIT", "BALANCE BROUGHT FORWARD", "BALANCE CARRIED FORWARD",
    "OPENING BALANCE", "CLOSING BALANCE", "BALANCE", "BROUGHT FORWARD",
    "CARRIED FORWARD", "INTEREST", "OVERDRAFT", "STATEMENT", "ACCOUNT NUMBER",
    "ACCOUNT", "SORT CODE", "HSBC"
]

def should_exclude(line: str) -> bool:
    upper = line.upper()
    return any(k in upper for k in EXCLUDE_KEYWORDS)

def normalize_date_hsbc(date_str: str) -> str:
    try:
        dt = datetime.strptime(date_str, "%d %b %y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return date_str

def clean_merchant(text: str) -> str:
    import re
    text = " ".join(text.split())
    text = re.sub(r"[£$€]", "", text)
    text = re.sub(r"\b(DR|CR)\b", "", text)
    return text.strip()

def extract_transactions(text: str) -> List[Dict]:
    transactions = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    current_date = None
    current_merchant_lines = []
    date_pattern = re.compile(r"\b(\d{2}\s+[A-Za-z]{3}\s+\d{2})\b")
    debit_marker_pattern = re.compile(r"^(VIS|BP|OBP|CARD|CONTACTLESS|\)\)\))\s*(.+)")
    amount_pattern = re.compile(r"\b(\d+\.\d{2})\b")
    for line in lines:
        if should_exclude(line):
            continue
        date_match = date_pattern.search(line)
        if date_match:
            current_date = normalize_date_hsbc(date_match.group(1))
            remainder = line[date_match.end():].strip()
            if remainder:
                marker_match = debit_marker_pattern.match(remainder)
                if marker_match:
                    merchant = clean_merchant(marker_match.group(2))
                    if merchant:
                        current_merchant_lines = [merchant]
                else:
                    if current_merchant_lines:
                        current_merchant_lines.append(remainder)
            continue
        marker_match = debit_marker_pattern.match(line)
        if marker_match:
            merchant = clean_merchant(marker_match.group(2))
            if merchant:
                current_merchant_lines = [merchant]
            continue
        amount_match = amount_pattern.search(line)
        if amount_match and current_date and current_merchant_lines:
            amount = float(amount_match.group(1))
            if "CR" not in line and amount > 0:
                merchant = clean_merchant(" ".join(current_merchant_lines))
                if merchant:
                    transactions.append({
                        "date": current_date,
                        "amount": amount,
                        "merchant": merchant,
                        "category": "Imported"
                    })
            current_merchant_lines = []
            continue
        if current_date and current_merchant_lines:
            current_merchant_lines.append(line)
    transactions.sort(key=lambda x: x["date"])
    return transactions

def parse_pdf_to_transactions(pdf_bytes: bytes) -> List[Dict]:
    with pdfplumber.open(pdf_bytes) as pdf:
        full_text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
        if not full_text.strip():
            return []
        return extract_transactions(full_text)
