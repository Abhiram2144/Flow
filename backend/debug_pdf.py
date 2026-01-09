#!/usr/bin/env python3
"""
Debug script to test PDF parsing locally.
Usage: python debug_pdf.py <path_to_pdf>
"""

import sys
import logging
from pathlib import Path
from services.pdf_parser import BankStatementParser

# Enable debug logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_pdf.py <path_to_pdf>")
        print("\nExample:")
        print("  python debug_pdf.py bank_statement.pdf")
        sys.exit(1)

    pdf_path = Path(sys.argv[1])
    
    if not pdf_path.exists():
        print(f"Error: File not found: {pdf_path}")
        sys.exit(1)

    print(f"\nTesting PDF: {pdf_path}")
    print(f"File size: {pdf_path.stat().st_size} bytes\n")

    # Read PDF bytes
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()

    # Parse
    print("Parsing PDF...")
    csv_output = BankStatementParser.parse_pdf_to_csv(pdf_bytes)

    # Display results
    lines = csv_output.split('\n')
    print(f"\nResult: {len(lines)} lines")
    print(f"Header: {lines[0]}")
    
    if len(lines) == 1:
        print("❌ NO TRANSACTIONS FOUND")
        print("\nPossible causes:")
        print("- PDF is not a bank statement")
        print("- PDF is scanned/image-based (not text-based)")
        print("- Transaction format is not recognized")
        print("\nTry uploading a CSV file instead (format: date,amount,merchant)")
    else:
        print(f"\n✓ Parsed {len(lines) - 1} transactions")
        print("\nFirst 3 transactions:")
        for line in lines[1:4]:
            print(f"  {line}")

    # Save for inspection
    output_path = pdf_path.with_suffix('.csv')
    with open(output_path, 'w') as f:
        f.write(csv_output)
    print(f"\nOutput saved to: {output_path}")
