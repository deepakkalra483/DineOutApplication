// DateTimeField.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DatePicker from "react-native-date-picker";
import { AppColors } from "../utils/AppColors";
import { AppFonts } from "../utils/AppFonts";

export default function DateTimeField({ label, mode = "date", value, onChange }) {
	const [open, setOpen] = useState(false);

	// Convert Date -> "YYYY-MM-DD"
	const formatDateToString = (date) => {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	};

	// Convert Date -> "HH:mm"
	const formatTimeToString = (date) => {
		const h = String(date.getHours()).padStart(2, "0");
		const m = String(date.getMinutes()).padStart(2, "0");
		return `${h}:${m}`;
	};

	// FIX: Ensure value is always a string for display
	const displayText =
		typeof value === "string"
			? value
			: mode === "date"
				? "Select Date"
				: "Select Time";

	return (
		<View style={{ marginBottom: 12 }}>
			{label && <Text style={styles.label}>{label}</Text>}

			<TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
				<Text style={styles.inputText}>{displayText}</Text>
			</TouchableOpacity>

			<DatePicker
				modal
				open={open}
				date={new Date()}
				mode={mode}
				onConfirm={(selected) => {
					setOpen(false);

					const formatted =
						mode === "date"
							? formatDateToString(selected)
							: formatTimeToString(selected);

					onChange(formatted); // SEND STRING
				}}
				onCancel={() => setOpen(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		fontSize: 14,
		marginBottom: 6,
		fontFamily: AppFonts.REGULAR,
		color: AppColors.LIGHT_GRAY_TEXT,
	},
	input: {
		padding: 12,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 10,
		backgroundColor: "#fff",
	},
	inputText: {
		fontSize: 16,
		color: "#333",
	},
});
