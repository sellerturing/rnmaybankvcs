import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
}

export default function GradientButton({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  gradientColors = ['#FFD700', '#FFA500', '#FF8C00'],
  borderColor = '#FFD700',
  borderWidth = 3,
  ...props
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: borderColor,
          borderWidth: borderWidth,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#cccccc', '#999999', '#666666'] : gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ThemedText style={[styles.buttonText, textStyle]}>
          {title}
        </ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  disabled: {
    shadowOpacity: 0.1,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
