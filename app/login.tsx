import { useTheme } from "@/context/ThemeContext";
import { login } from "@/services/auth-endpoints";
import { getMyProfile } from "@/services/profile-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import { z } from "zod";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .email(t("validation_email_invalid"))
      .min(1, t("validation_email_required")),
    password: z.string().min(1, t("validation_password_required")),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
type FormErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const schema = createLoginSchema(t);
    const result = schema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        Toast.success(t("login_success"));

        try {
          const profile = await getMyProfile();
          if (profile) {
            router.replace("/dashboard");
          } else {
            router.replace("/create-profile");
          }
        } catch {
          router.replace("/dashboard");
        }
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
          Toast.error(t("login_failed"));
        }
      }
    } catch (error) {
      Toast.error(t("login_error"));
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
      <View style={styles.content}>
        <MaterialIcons
          name="recycling"
          size={80}
          color={colors.textPrimary}
          style={{ marginBottom: 20 }}
        />

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("login_title")}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("login_subtitle")}
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
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

          <TouchableOpacity
            onPress={handleLogin}
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
                style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
              >
                {t("login_button")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t("no_account")}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/register")}>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>
              {t("register_link")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
