import { useTheme } from "@/context/ThemeContext";
import { register } from "@/services/auth-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import { z } from "zod";

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z
        .email(t("validation_email_invalid"))
        .min(1, t("validation_email_required")),
      password: z
        .string()
        .min(1, t("validation_password_required"))
        .min(8, t("validation_password_min")),
      passwordConfirmation: z
        .string()
        .min(1, t("validation_confirm_password_required")),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("passwords_not_match"),
      path: ["passwordConfirmation"],
    });

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const schema = createRegisterSchema(t);
    const result = schema.safeParse({ email, password, passwordConfirmation });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password, passwordConfirmation);
      if (response.success) {
        Toast.success(t("register_success"));
        router.replace("/");
      } else {
        if (response.errors) {
          const fieldErrors: FormErrors = {};
          Object.keys(response.errors).forEach((key) => {
            if (key === "email") fieldErrors.email = response.errors![key][0];
            if (key === "password")
              fieldErrors.password = response.errors![key][0];
          });
          setErrors(fieldErrors);
        }

        if (response.message) {
          Toast.error(response.message);
        } else if (!response.errors) {
          Toast.error(t("register_failed"));
        }
      }
    } catch (error) {
      Toast.error(t("register_error"));
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <MaterialIcons
            name="recycling"
            size={80}
            color={colors.textPrimary}
            style={{ marginBottom: 20 }}
          />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("register_title")}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("register_subtitle")}
          </Text>

          <View style={styles.form}>
            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.email
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="email"
                  size={20}
                  color={
                    errors.email
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("email_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError("email");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.email}
                </Text>
              )}
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.password
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={
                    errors.password
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError("password");
                  }}
                  secureTextEntry
                />
              </View>
              {errors.password && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.password}
                </Text>
              )}
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.passwordConfirmation
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color={
                    errors.passwordConfirmation
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("confirm_password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={passwordConfirmation}
                  onChangeText={(text) => {
                    setPasswordConfirmation(text);
                    clearError("passwordConfirmation");
                  }}
                  secureTextEntry
                />
              </View>
              {errors.passwordConfirmation && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.passwordConfirmation}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[
                styles.button,
                {
                  backgroundColor: colors.buttonPrimaryBackground,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonPrimaryText} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors.buttonPrimaryText },
                  ]}
                >
                  {t("register_button")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t("have_account")}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={[styles.linkText, { color: colors.textPrimary }]}>
                {t("login_link")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
