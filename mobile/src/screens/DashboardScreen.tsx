/**
 * Main Dashboard Screen
 * 
 * Displays current momentum state with weather-based UI.
 * Pure reactive UI - no business logic.
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/utils/api";
import { WeatherState } from "@/types/api";

// Weather-based color schemes
const WEATHER_COLORS = {
  [WeatherState.SUNNY]: {
    bg: "#FFF9E6",
    primary: "#FFD700",
    text: "#333333",
  },
  [WeatherState.CLEAR_NIGHT]: {
    bg: "#1a1a2e",
    primary: "#00d4ff",
    text: "#ffffff",
  },
  [WeatherState.CLOUDY]: {
    bg: "#E8E8E8",
    primary: "#999999",
    text: "#333333",
  },
  [WeatherState.RAIN]: {
    bg: "#D0E8F2",
    primary: "#4A90E2",
    text: "#333333",
  },
  [WeatherState.STORM]: {
    bg: "#4A4A4A",
    primary: "#FF4444",
    text: "#ffffff",
  },
};

export default function DashboardScreen() {
  const { currentExplanation, isLoadingMomentum, setExplanation, setLoadingMomentum } =
    useAppStore();

  useEffect(() => {
    loadMomentum();
  }, []);

  const loadMomentum = async () => {
    try {
      setLoadingMomentum(true);
      const explanation = await apiClient.getMomentum();
      setExplanation(explanation);
    } catch (error) {
      console.error("Failed to load momentum:", error);
    } finally {
      setLoadingMomentum(false);
    }
  };

  if (!currentExplanation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  const colors = WEATHER_COLORS[currentExplanation.weather_state];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Weather State */}
      <View style={styles.header}>
        <Text style={[styles.emoji, { fontSize: 48 }]}>
          {getWeatherEmoji(currentExplanation.weather_state)}
        </Text>
        <Text style={[styles.weatherState, { color: colors.text }]}>
          {currentExplanation.weather_state.replace(/_/g, " ").toUpperCase()}
        </Text>
        <Text style={[styles.confidence, { color: colors.text }]}>
          Confidence: {(currentExplanation.momentum_confidence * 100).toFixed(0)}%
        </Text>
      </View>

      {/* Main Narrative */}
      <View style={[styles.card, { borderLeftColor: colors.primary }]}>
        <Text style={[styles.narrativeText, { color: colors.text }]}>
          {currentExplanation.narrative}
        </Text>
      </View>

      {/* Context Breakdowns */}
      {currentExplanation.contexts.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Understanding</Text>
          {currentExplanation.contexts.map((context, index) => (
            <View key={index} style={[styles.contextCard, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.contextLabel, { color: colors.primary }]}>Observation</Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {context.observation}
              </Text>

              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 8 }]}>
                Pattern
              </Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {context.pattern}
              </Text>

              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 8 }]}>
                Inference
              </Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {context.inference}
              </Text>

              <Text style={[styles.contextConfidence, { color: colors.primary }]}>
                Confidence: {(context.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions */}
      {currentExplanation.gentle_suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gentle Suggestions</Text>
          {currentExplanation.gentle_suggestions.map((suggestion, index) => (
            <View key={index} style={[styles.suggestionItem, { borderLeftColor: colors.primary }]}>
              <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Refresh Button */}
      <View style={styles.footer}>
        <Text
          style={[styles.refreshButton, { color: colors.primary }]}
          onPress={loadMomentum}
          disabled={isLoadingMomentum}
        >
          {isLoadingMomentum ? "Updating..." : "Refresh Momentum"}
        </Text>
      </View>
    </ScrollView>
  );
}

function getWeatherEmoji(state: WeatherState): string {
  const emojiMap: Record<WeatherState, string> = {
    [WeatherState.SUNNY]: "☀️",
    [WeatherState.CLEAR_NIGHT]: "🌙",
    [WeatherState.CLOUDY]: "☁️",
    [WeatherState.RAIN]: "🌧️",
    [WeatherState.STORM]: "⛈️",
  };
  return emojiMap[state] || "☀️";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  emoji: {
    marginBottom: 8,
  },
  weatherState: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    fontWeight: "400",
  },
  card: {
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 24,
    borderRadius: 4,
  },
  narrativeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contextCard: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  contextValue: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  contextConfidence: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    paddingBottom: 32,
  },
  refreshButton: {
    fontSize: 16,
    fontWeight: "600",
    padding: 12,
  },
});
