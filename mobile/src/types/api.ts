/**
 * API Type Definitions for Flow Mobile App
 * 
 * These types mirror the backend models but are tailored for mobile usage.
 * No business logic, state management, or complex processing on mobile.
 */

export enum TransactionSource {
  BANK = "bank",
  MANUAL = "manual",
  RECEIPT = "receipt",
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category?: string;
  source: TransactionSource;
  confidence: number;
  notes?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
}

export enum WeatherState {
  SUNNY = "sunny",
  CLEAR_NIGHT = "clear_night",
  CLOUDY = "cloudy",
  RAIN = "rain",
  STORM = "storm",
}

export interface ExplainabilityContext {
  observation: string;
  pattern: string;
  inference: string;
  confidence: number;
}

export interface Explanation {
  weather_state: WeatherState;
  momentum_confidence: number;
  contexts: ExplainabilityContext[];
  narrative: string;
  gentle_suggestions: string[];
}

export interface APIError {
  detail: string;
  status_code: number;
}
