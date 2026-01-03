import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import {
  deleteAccount,
  getCurrentUserEmail,
  logout,
  updateEmail,
  updatePassword,
} from "@/services/auth-endpoints";
import { getMyProfile, updateProfile } from "@/services/profile-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

type ThemeName = "light" | "dark" | null;

export default function SettingsScreen() {
  const { colors, themeName, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [deleteError, setDeleteError] = useState("");
  const [profileError, setProfileError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const [email, profile] = await Promise.all([
          getCurrentUserEmail(),
          getMyProfile(),
        ]);

        if (email) {
          setCurrentEmail(email);
        }
        if (profile) {
          setUsername(profile.username || "");
          setBio(profile.bio || "");
        }
      };

      fetchData();
    }, [])
  );

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      setProfileError(t("validation_username_required"));
      return;
    }

    setProfileError("");
    setSavingProfile(true);
    try {
      const result = await updateProfile({ username, bio });

      if (result.success) {
        Toast.success(t("profile_updated"));
      } else {
        const errorMessage =
          result.errors?.username?.[0] ||
          result.message ||
          t("profile_update_failed");
        setProfileError(errorMessage);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailChange = async () => {
    // Validate
    if (!newEmail.trim()) {
      setEmailError(t("validation_new_email_required"));
      return;
    }

    setEmailError("");
    setUpdatingEmail(true);
    try {
      const result = await updateEmail(newEmail);

      if (result.success) {
        Toast.success(t("email_updated"));
        setCurrentEmail(newEmail);
        setEmailModalVisible(false);
        setNewEmail("");
      } else {
        const errorMessage =
          result.errors?.email?.[0] ||
          result.message ||
          t("email_update_failed");
        setEmailError(errorMessage);
      }
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.currentPassword = t("validation_current_password_required");
    }
    if (!newPassword) {
      errors.newPassword = t("validation_new_password_required");
    } else if (newPassword.length < 8) {
      errors.newPassword = t("validation_new_password_min");
    }
    if (!confirmNewPassword) {
      errors.confirmPassword = t("validation_confirm_new_password_required");
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmPassword = t("validation_passwords_not_match");
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setUpdatingPassword(true);
    try {
      const result = await updatePassword(
        currentPassword,
        newPassword,
        confirmNewPassword
      );

      if (result.success) {
        Toast.success(t("password_updated"));
        setPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        if (result.errors?.current_password) {
          setPasswordErrors({
            currentPassword: result.errors.current_password[0],
          });
        } else if (result.errors?.new_password) {
          setPasswordErrors({ newPassword: result.errors.new_password[0] });
        } else {
          Toast.error(result.message || t("password_update_failed"));
        }
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      Toast.success(t("logged_out"));
      setLogoutModalVisible(false);
      router.replace("/");
    } catch {
      Toast.error(t("login_error"));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t("validation_delete_password_required"));
      return;
    }

    setDeleteError("");
    setDeletingAccount(true);
    try {
      const result = await deleteAccount(deletePassword);

      if (result.success) {
        Toast.success(t("account_deleted"));
        setDeleteModalVisible(false);
        setDeletePassword("");
        router.replace("/");
      } else {
        const errorMessage =
          result.errors?.password?.[0] ||
          result.message ||
          t("account_delete_failed");
        setDeleteError(errorMessage);
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const renderThemeOption = (theme: ThemeName, label: string) => {
    const isSelected = themeName === theme;
    return (
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            backgroundColor: isSelected
              ? colors.buttonPrimaryBackground
              : colors.inputBackground,
            borderColor: colors.inputBorder,
          },
        ]}
        onPress={() => handleThemeChange(theme)}
      >
        <Text
          style={[
            styles.optionButtonText,
            {
              color: isSelected ? colors.buttonPrimaryText : colors.inputText,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPasswordInput = (
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    showPassword: boolean,
    toggleShow: () => void,
    error?: string
  ) => (
    <View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.buttonDangerBackground
              : colors.inputBorder,
          },
        ]}
      >
        <MaterialIcons
          name="lock"
          size={20}
          color={error ? colors.buttonDangerBackground : colors.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.inputText }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShow}>
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text
          style={[styles.errorText, { color: colors.buttonDangerBackground }]}
        >
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
        {t("settings_title")}
      </Text>

      {/* App Settings Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("settings_app_title")}
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("settings_theme")}
        </Text>
        <View style={styles.optionRow}>
          {renderThemeOption("light", t("settings_theme_light"))}
          {renderThemeOption("dark", t("settings_theme_dark"))}
          {renderThemeOption(null, t("settings_theme_system"))}
        </View>

        <View style={styles.languageRow}>
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary, marginTop: 16, marginBottom: 0 },
            ]}
          >
            {t("settings_language")}
          </Text>
          <LanguageSwitcher />
        </View>
      </View>

      {/* Profile Edit Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("settings_profile_title")}
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("settings_username")}
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.background,
              borderColor: profileError
                ? colors.buttonDangerBackground
                : colors.inputBorder,
            },
          ]}
        >
          <MaterialIcons
            name="person"
            size={20}
            color={
              profileError
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
              if (profileError) setProfileError("");
            }}
            autoCapitalize="none"
          />
        </View>
        {profileError && (
          <Text
            style={[styles.errorText, { color: colors.buttonDangerBackground }]}
          >
            {profileError}
          </Text>
        )}

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          {t("settings_bio")}
        </Text>
        <View
          style={[
            styles.inputContainer,
            styles.bioInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder={t("bio_placeholder")}
            placeholderTextColor={colors.textSecondary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.buttonPrimaryBackground },
          ]}
          onPress={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
            <ActivityIndicator size="small" color={colors.buttonPrimaryText} />
          ) : (
            <Text
              style={[
                styles.actionButtonText,
                { color: colors.buttonPrimaryText },
              ]}
            >
              {t("settings_save_profile")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Email Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("settings_email_title")}
        </Text>

        <View style={styles.emailRow}>
          <Text style={[styles.emailText, { color: colors.inputText }]}>
            {currentEmail}
          </Text>
          <TouchableOpacity
            style={[
              styles.changeButton,
              { backgroundColor: colors.buttonPrimaryBackground },
            ]}
            onPress={() => setEmailModalVisible(true)}
          >
            <Text
              style={[
                styles.changeButtonText,
                { color: colors.buttonPrimaryText },
              ]}
            >
              {t("settings_change_email")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("settings_password_title")}
        </Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.buttonPrimaryBackground },
          ]}
          onPress={() => setPasswordModalVisible(true)}
        >
          <MaterialIcons
            name="lock"
            size={20}
            color={colors.buttonPrimaryText}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: colors.buttonPrimaryText },
            ]}
          >
            {t("settings_change_password")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.singleActionButton,
            { backgroundColor: colors.buttonPrimaryBackground },
          ]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color={colors.buttonPrimaryText}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: colors.buttonPrimaryText },
            ]}
          >
            {t("settings_logout")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            shadowColor: colors.shadowColor,
            marginBottom: 40,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.singleActionButton,
            { backgroundColor: colors.buttonDangerBackground },
          ]}
          onPress={() => setDeleteModalVisible(true)}
        >
          <MaterialIcons
            name="delete-forever"
            size={20}
            color={colors.buttonDangerText}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: colors.buttonDangerText },
            ]}
          >
            {t("settings_delete_account")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email Change Modal */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("settings_change_email_title")}
            </Text>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: emailError
                      ? colors.buttonDangerBackground
                      : colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons
                  name="email"
                  size={20}
                  color={
                    emailError
                      ? colors.buttonDangerBackground
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder={t("settings_new_email")}
                  placeholderTextColor={colors.textSecondary}
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.buttonDangerBackground },
                  ]}
                >
                  {emailError}
                </Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.inputBorder },
                ]}
                onPress={() => {
                  setEmailModalVisible(false);
                  setNewEmail("");
                  setEmailError("");
                }}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.inputText }]}
                >
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonPrimaryBackground },
                ]}
                onPress={handleEmailChange}
                disabled={updatingEmail}
              >
                {updatingEmail ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonPrimaryText}
                  />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonPrimaryText },
                    ]}
                  >
                    {t("settings_submit")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("settings_change_password")}
            </Text>

            {renderPasswordInput(
              currentPassword,
              (text) => {
                setCurrentPassword(text);
                if (passwordErrors.currentPassword) {
                  setPasswordErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined,
                  }));
                }
              },
              t("settings_current_password"),
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword),
              passwordErrors.currentPassword
            )}

            <View style={{ marginTop: 12 }}>
              {renderPasswordInput(
                newPassword,
                (text) => {
                  setNewPassword(text);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      newPassword: undefined,
                    }));
                  }
                },
                t("settings_new_password"),
                showNewPassword,
                () => setShowNewPassword(!showNewPassword),
                passwordErrors.newPassword
              )}
            </View>

            <View style={{ marginTop: 12 }}>
              {renderPasswordInput(
                confirmNewPassword,
                (text) => {
                  setConfirmNewPassword(text);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                },
                t("settings_confirm_new_password"),
                showConfirmPassword,
                () => setShowConfirmPassword(!showConfirmPassword),
                passwordErrors.confirmPassword
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.inputBorder },
                ]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.inputText }]}
                >
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonPrimaryBackground },
                ]}
                onPress={handlePasswordChange}
                disabled={updatingPassword}
              >
                {updatingPassword ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonPrimaryText}
                  />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonPrimaryText },
                    ]}
                  >
                    {t("settings_submit")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("settings_logout_confirm_title")}
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              {t("settings_logout_confirm_message")}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.inputBorder },
                ]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.inputText }]}
                >
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonPrimaryBackground },
                ]}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonPrimaryText}
                  />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonPrimaryText },
                    ]}
                  >
                    {t("settings_confirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("settings_delete_confirm_title")}
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              {t("settings_delete_confirm_message")}
            </Text>

            {renderPasswordInput(
              deletePassword,
              (text) => {
                setDeletePassword(text);
                if (deleteError) setDeleteError("");
              },
              t("password_placeholder"),
              showDeletePassword,
              () => setShowDeletePassword(!showDeletePassword),
              deleteError
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.inputBorder },
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.inputText }]}
                >
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonDangerBackground },
                ]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonDangerText}
                  />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonDangerText },
                    ]}
                  >
                    {t("settings_delete_button")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
    paddingVertical: 14,
    fontSize: 16,
  },
  bioInput: {
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },

  singleActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emailText: {
    fontSize: 16,
    flex: 1,
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
