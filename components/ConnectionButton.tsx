import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';

interface ConnectionButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const ConnectionButton = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
}: ConnectionButtonProps) => {
  const ButtonContainer = Platform.OS === 'ios' ? BlurView : TouchableOpacity;
  const blurProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

  const buttonStyle = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const textStyle = variant === 'primary' ? styles.textPrimary : styles.textSecondary;

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || isLoading} activeOpacity={0.7}>
        <ButtonContainer {...blurProps} style={[styles.button, buttonStyle, disabled && styles.buttonDisabled]}>
          {isLoading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={textStyle}>{title}</Text>
          )}
        </ButtonContainer>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[styles.button, buttonStyle, disabled && styles.buttonDisabled]}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryHover,
  },
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  textSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
});

