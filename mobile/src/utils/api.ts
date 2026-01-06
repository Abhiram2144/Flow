/**
 * API Client for Flow Mobile App
 * 
 * Simple, reactive API wrapper - no caching logic, no retry logic.
 * All network requests are straightforward.
 */

import axios, { AxiosInstance } from "axios";
import { Explanation, Transaction } from "@/types/api";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class FlowAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get current momentum & explanation
   */
  async getMomentum(): Promise<Explanation> {
    const response = await this.client.get<Explanation>("/momentum");
    return response.data;
  }

  /**
   * Submit a manual transaction
   */
  async createTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const response = await this.client.post<Transaction>("/transactions", transaction);
    return response.data;
  }

  /**
   * Upload a receipt image
   */
  async uploadReceipt(file: FormData): Promise<Transaction> {
    const response = await this.client.post<Transaction>("/transactions/receipt", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Get recent transactions
   */
  async getTransactions(limit: number = 20): Promise<Transaction[]> {
    const response = await this.client.get<Transaction[]>("/transactions", {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>("/health");
    return response.data;
  }
}

export const apiClient = new FlowAPIClient();
