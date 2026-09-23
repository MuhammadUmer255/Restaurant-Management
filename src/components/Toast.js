import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function Toast({ visible, message, type = 'success', onDismiss }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 20,
        useNativeDriver: true,
        friction: 6,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible && translateY._value === -100) return null;

  // Toast ke background/border theme aur type ke hisaab se
  const palette = {
    success: {
      bg: isDark ? '#103B2B' : '#DCFCE7',
      border: colors.success,
      icon: 'checkmark-circle-outline',
    },
    error: {
      bg: isDark ? '#3B1822' : '#FFE4E9',
      border: colors.danger,
      icon: 'alert-circle-outline',
    },
    info: {
      bg: isDark ? '#152340' : '#E0EDFF',
      border: '#4A90E2',
      icon: 'information-circle-outline',
    },
  };
  const current = palette[type] || palette.error;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { backgroundColor: current.bg, borderColor: current.border },
        { transform: [{ translateY }] },
      ]}
    >
      <Ionicons
        name={current.icon}
        size={20}
        color={current.border}
        style={{ marginRight: 8 }}
      />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      top: 40,
      left: 20,
      right: 20,
      zIndex: 9999,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    message: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
  });