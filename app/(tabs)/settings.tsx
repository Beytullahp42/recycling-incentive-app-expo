import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { logout } from "@/services/auth-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

  // Profile state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Email modal state
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Password modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logout modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Delete account modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const currentEmail = "user@example.com"; // Placeholder - replace with actual user email

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile save
  };

  const handleEmailChange = () => {
    // TODO: Implement email change
    setEmailModalVisible(false);
    setNewEmail("");
  };

  const handlePasswordChange = () => {
    // TODO: Implement password change
    setPasswordModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
      Toast.success(t("logged_out"));
      router.replace("/login");
    } catch {
      Toast.error(t("login_error"));
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account
    setDeleteModalVisible(false);
    setDeletePassword("");
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
    toggleShow: () => void
  ) => (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.inputBackground,
          borderColor: colors.inputBorder,
        },
      ]}
    >
      <MaterialIcons
        name="lock"
        size={20}
        color={colors.textSecondary}
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
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <MaterialIcons
            name="person"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder={t("username_placeholder")}
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

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
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: colors.buttonPrimaryText },
            ]}
          >
            {t("settings_save_profile")}
          </Text>
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
            styles.actionButton,
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
            styles.actionButton,
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

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                placeholder={t("settings_new_email")}
                placeholderTextColor={colors.textSecondary}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.buttonPrimaryText },
                  ]}
                >
                  {t("settings_submit")}
                </Text>
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
              setCurrentPassword,
              t("settings_current_password"),
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword)
            )}

            <View style={{ marginTop: 12 }}>
              {renderPasswordInput(
                newPassword,
                setNewPassword,
                t("settings_new_password"),
                showNewPassword,
                () => setShowNewPassword(!showNewPassword)
              )}
            </View>

            <View style={{ marginTop: 12 }}>
              {renderPasswordInput(
                confirmNewPassword,
                setConfirmNewPassword,
                t("settings_confirm_new_password"),
                showConfirmPassword,
                () => setShowConfirmPassword(!showConfirmPassword)
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
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.buttonPrimaryText },
                  ]}
                >
                  {t("settings_submit")}
                </Text>
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
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.buttonPrimaryText },
                  ]}
                >
                  {t("settings_confirm")}
                </Text>
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
              setDeletePassword,
              t("password_placeholder"),
              showDeletePassword,
              () => setShowDeletePassword(!showDeletePassword)
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
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.buttonDangerText },
                  ]}
                >
                  {t("settings_delete_button")}
                </Text>
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
});
