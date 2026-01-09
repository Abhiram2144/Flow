import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { uploadBankStatement } from "@/lib/api";

export default function BankUploadScreen() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setUploading(true);

      const file = result.assets[0];
      await uploadBankStatement({ uri: file.uri, name: file.name, type: file.mimeType });

      Alert.alert("Success", "Bank statement uploaded");
      router.replace("/(main)");
    } catch (error: any) {
      const message = error.message || "Failed to upload";
      
      // Parse backend error message for better UX
      let displayMessage = message;
      if (message.includes("PDF could not be read")) {
        displayMessage = "PDF format not recognized. Please try:\n• A different bank statement PDF\n• A CSV file (format: date,amount,merchant)";
      } else if (message.includes("CSV")) {
        displayMessage = "CSV format error. Please ensure columns: date, amount, merchant";
      }
      
      Alert.alert("Upload Error", displayMessage);
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(main)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload a bank statement</Text>
        <Text style={styles.explanation}>
          This helps Flow understand your spending rhythm.
        </Text>
        <Text style={styles.supportedFormats}>
          Supported: CSV or PDF{"\n"}(CSV format: date, amount, merchant)
        </Text>

        {uploading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleUpload} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Upload CSV or PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D0F',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#EDE7DB',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 16,
    color: '#B8B2A7',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportedFormats: {
    fontSize: 13,
    color: '#8C8577',
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 6,
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#0B0D0F',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#B8B2A7',
    textAlign: 'center',
  },
  loader: {
    marginTop: 32,
  },
});
