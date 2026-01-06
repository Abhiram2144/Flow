"""
SQLAlchemy ORM models - the actual database schema.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from db.database import Base


class User(Base):
    """User account."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    bank_transactions = relationship("BankTransaction", back_populates="user", cascade="all, delete-orphan")


class Budget(Base):
    """Monthly budget."""
    __tablename__ = "budgets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String(7), nullable=False)  # YYYY-MM format
    total_budget = Column(Float, nullable=False)  # Total budget amount
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="budgets")

    # Constraint: one budget per user per month (enforced in code)


class Transaction(Base):
    """User transaction (manual or real-time)."""
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    merchant = Column(String(255), nullable=False, index=True)
    source = Column(String(20), nullable=False)  # "manual" or "bank"
    category = Column(String(100), nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="transactions")


class BankTransaction(Base):
    """Historical bank statement transaction (bootstrap data)."""
    __tablename__ = "bank_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    merchant = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="bank_transactions")
