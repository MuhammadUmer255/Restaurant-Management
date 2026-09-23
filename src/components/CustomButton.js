import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const getButtonStyle = () => {
    if (isPrimary) return styles.primary;
    if (isDanger) return styles.danger;
    return styles.outline;
  };

  const getTextStyle = () => {
    if (isPrimary || isDanger) return styles.textPrimary;
    return styles.textOutline;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#FFFFFF' : colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    base: {
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    primary: {
      backgroundColor: c.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.border,
    },
    danger: {
      backgroundColor: c.danger,
    },
    disabled: {
      opacity: 0.5,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrap: {
      marginRight: 8,
    },
    text: {
      fontWeight: '700',
      fontSize: 15,
    },
    textPrimary: {
      color: '#FFFFFF',
    },
    textOutline: {
      color: c.primary,
    },
  });