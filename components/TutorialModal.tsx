import { useTheme } from "@/context/ThemeContext";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_WIDTH = Math.min(340, SCREEN_WIDTH - 48);

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const tutorialPages = [
  {
    titleKey: "tutorial_title",
    messageKey: "tutorial_message",
    image: require("@/assets/images/scanqr.png"),
  },
  {
    titleKey: "tutorial_title",
    messageKey: "tutorial_message_2",
    image: require("@/assets/images/scanbarcode.png"),
  },
  {
    titleKey: "warning_title",
    messageKey: "warning_message",
    image: require("@/assets/images/takeproofpic.png"),
  },
];

export default function TutorialModal({
  visible,
  onClose,
}: TutorialModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index ?? 0);
    }
  }).current;

  const renderPage = ({
    item,
    index,
  }: {
    item: (typeof tutorialPages)[0];
    index: number;
  }) => (
    <View style={[styles.page, { width: MODAL_WIDTH - 48 }]}>
      <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
        {t(item.titleKey, `Step ${index + 1}`)}
      </Text>
      <View style={styles.tutorialImageContainer}>
        <Image
          source={item.image}
          style={styles.tutorialImage}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
        {t(item.messageKey, "Tutorial step description")}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.inputBackground, width: MODAL_WIDTH },
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={tutorialPages}
            renderItem={renderPage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            keyExtractor={(_, index) => index.toString()}
            scrollEventThrottle={16}
          />

          {/* Page Indicators */}
          <View style={styles.pageIndicatorContainer}>
            {tutorialPages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  {
                    backgroundColor:
                      currentPage === index
                        ? colors.buttonPrimaryBackground
                        : colors.textSecondary,
                  },
                ]}
              />
            ))}
          </View>

          {/* Next button (pages 1 & 2) or Close button (page 3) */}
          <TouchableOpacity
            onPress={
              currentPage === tutorialPages.length - 1 ? onClose : handleNext
            }
            style={[
              styles.modalButton,
              { backgroundColor: colors.buttonPrimaryBackground },
            ]}
          >
            <Text
              style={[
                styles.modalButtonText,
                { color: colors.buttonPrimaryText },
              ]}
            >
              {currentPage === tutorialPages.length - 1
                ? t("close", "Close")
                : t("next", "Next")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignItems: "center",
  },
  page: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  tutorialImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  tutorialImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
