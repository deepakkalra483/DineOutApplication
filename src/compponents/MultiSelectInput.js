// MultiSelectInput.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { AppColors } from "../utils/AppColors";

export default function MultiSelectInput({
  label,
  options = [],
  value = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const toggleItem = (item) => {
    let updated = [];

    if (value.includes(item)) {
      updated = value.filter((v) => v !== item);
    } else {
      updated = [...value, item];
    }

    onChange(updated);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.valueText}>
          {value.length === 0 ? "Select Options" : value.join(", ")}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{label}</Text>

            <ScrollView style={{ maxHeight: 250 }}>
              {options.map((item, index) => {
                const selected = value.includes(item);

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionRow}
                    onPress={() => toggleItem(item)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    />
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
    color: AppColors.LIGHT_GRAY_TEXT, // green accent
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  valueText: {
    fontSize: 16,
    color: "#333",
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A7E30",
    marginBottom: 15,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0A7E30",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "#0A7E30",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "#0A7E30",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
