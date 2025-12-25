import WarningModal from "@/components/WarningModal";
import { useTheme } from "@/context/ThemeContext";
import { StoreProfileDTO } from "@/dtos/StoreProfileDTO";
import { storeProfile } from "@/services/profile-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

const MIN_AGE = 13;

const isAtLeastYearsOld = (dateString: string) => {
  const now = new Date();
  const birthDate = new Date(dateString);

  // Check if invalid date
  if (isNaN(birthDate.getTime())) return false;

  const age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())
      ? age - 1
      : age;

  return actualAge >= MIN_AGE;
};

const createProfileSchema = (t: (key: string) => string) =>
  z.object({
    first_name: z.string().min(1, t("validation_first_name_required")),
    last_name: z.string().min(1, t("validation_last_name_required")),
    username: z
      .string()
      .min(1, t("validation_username_required"))
      .max(255, t("validation_username_max")),
    bio: z.string().optional(),
    birth_date: z
      .string()
      .min(1, t("validation_birth_date_required"))
      .refine(isAtLeastYearsOld, t("validation_age_minimum")),
  });

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;
type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

export default function CreateProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [date, setDate] = useState(new Date());
  const [birthDate, setBirthDate] = useState(""); // Internal: YYYY-MM-DD
  const [birthDateDisplay, setBirthDateDisplay] = useState(""); // Display: DD-MM-YYYY

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = (): boolean => {
    const schema = createProfileSchema(t);
    const result = schema.safeParse({
      first_name: firstName,
      last_name: lastName,
      username: username,
      bio: bio || undefined,
      birth_date: birthDate,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileFormData;
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

  const submitProfile = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const data: StoreProfileDTO = {
        first_name: firstName,
        last_name: lastName,
        username: username,
        bio: bio || null,
        birth_date: birthDate,
      };

      const response = await storeProfile(data);
      if (response.success) {
        Toast.success(t("profile_created_success"));
        router.replace("/");
      } else {
        if (response.errors) {
          const fieldErrors: FormErrors = {};
          Object.keys(response.errors).forEach((key) => {
            const field = key as keyof ProfileFormData;
            if (response.errors![key]) {
              fieldErrors[field] = response.errors![key][0];
            }
          });
          setErrors(fieldErrors);
        }

        if (response.message) {
          Toast.error(response.message);
        } else if (!response.errors) {
          Toast.error(t("profile_create_failed"));
        }
      }
    } catch {
      Toast.error(t("profile_create_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    if (!validateForm()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatDateForDisplay = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForAPI = (d: Date): string => {
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    if (event.type === "set" || Platform.OS === "ios") {
      setBirthDate(formatDateForAPI(currentDate));
      setBirthDateDisplay(formatDateForDisplay(currentDate));
      clearError("birth_date");
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
    } else {
      setShowDatePicker(false);
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
            name="person-add"
            size={80}
            color={colors.textPrimary}
            style={{ marginBottom: 20 }}
          />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("create_profile_title")}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("create_profile_subtitle")}
          </Text>

          <View style={styles.form}>
            {/* First Name */}
            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.first_name
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={20}
                  color={
                    errors.first_name
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("first_name_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    clearError("first_name");
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.first_name && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.first_name}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.last_name
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color={
                    errors.last_name
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("last_name_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    clearError("last_name");
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.last_name && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.last_name}
                </Text>
              )}
            </View>

            {/* Username */}
            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.username
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="alternate-email"
                  size={20}
                  color={
                    errors.username
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("username_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    clearError("username");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Birth Date */}
            <View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.birth_date
                        ? colors.buttonDangerBackground
                        : colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="cake"
                    size={20}
                    color={
                      errors.birth_date
                        ? colors.buttonDangerBackground
                        : colors.textSecondary
                    }
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.input,
                      {
                        color: birthDateDisplay
                          ? colors.inputText
                          : colors.textSecondary,
                        paddingVertical: 16,
                      },
                    ]}
                  >
                    {birthDateDisplay || t("birth_date_placeholder")}
                  </Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
              {errors.birth_date && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.birth_date}
                </Text>
              )}
            </View>

            {/* Bio (optional) */}
            <View>
              <View
                style={[
                  styles.inputContainer,
                  styles.textAreaContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.bio
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={
                    errors.bio
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.inputText },
                  ]}
                  placeholder={t("bio_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={bio}
                  onChangeText={(text) => {
                    setBio(text);
                    clearError("bio");
                  }}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {errors.bio && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {errors.bio}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleCreateProfile}
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
                  {t("create_profile_button")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <WarningModal
        visible={showConfirmModal}
        title={t("profile_confirm_title")}
        message={t("profile_confirm_message")}
        onConfirm={submitProfile}
        onCancel={() => setShowConfirmModal(false)}
        confirmText={t("profile_confirm_yes")}
        cancelText={t("profile_confirm_cancel")}
      />
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
  textAreaContainer: {
    alignItems: "flex-start",
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
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
});
