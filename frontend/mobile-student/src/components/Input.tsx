import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, isPassword, rightIcon, ...props }) => {
  const [isSecure, setIsSecure] = React.useState(isPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.iconContainer}>
            {isSecure ? (
              <EyeOff color={COLORS.textMuted} size={20} />
            ) : (
              <Eye color={COLORS.textMuted} size={20} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    color: COLORS.textDefault,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  iconContainer: {
    padding: 16,
  },
});
