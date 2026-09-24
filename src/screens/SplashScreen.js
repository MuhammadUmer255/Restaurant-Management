import React, { useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { isDark, colors = {} } = useTheme();

  // Safe color fallbacks for theme consistency
  const themeColors = useMemo(
    () => ({
      bg: colors?.bg || (isDark ? '#070E20' : '#FFFFFF'),
      card: colors?.card || (isDark ? '#0D162C' : '#F5F7FA'),
      text: colors?.text || (isDark ? '#FFFFFF' : '#1A1D26'),
      muted: colors?.muted || (isDark ? '#8D96AA' : '#64748B'),
      primary: colors?.primary || '#FF7622',
      border: colors?.border || (isDark ? '#202D49' : '#E2E8F0'),
      footerText: colors?.icon || (isDark ? '#68738D' : '#94A3B8'),
    }),
    [colors, isDark]
  );

  const styles = useMemo(() => makeStyles(themeColors), [themeColors]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate to LoginScreen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.bg}
        translucent={false}
      />

      {/* Animated Brand Section */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Vector Icon Logo Badge */}
        <View style={styles.logoBadge}>
          <Icon
            name="restaurant-outline"
            size={48}
            color={themeColors.primary}
          />
        </View>

        {/* GourmetOS Title */}
        <Text style={styles.restaurantName}>GourmetOS</Text>
        <Text style={styles.tagline}>Smart Restaurant Operations</Text>

        {/* Short Subtitle */}
        <Text style={styles.description}>
          All-in-one POS, table management, and order orchestration platform.
        </Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <ActivityIndicator
          size="small"
          color={themeColors.primary}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.footerText}>Initializing System...</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    logoBadge: {
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: c.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.border,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    restaurantName: {
      fontSize: 36,
      fontWeight: '900',
      color: c.text,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    tagline: {
      fontSize: 14,
      fontWeight: '700',
      color: c.primary,
      marginTop: 6,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    description: {
      fontSize: 13,
      color: c.muted,
      textAlign: 'center',
      marginTop: 14,
      lineHeight: 20,
      maxWidth: width * 0.8,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      alignItems: 'center',
    },
    footerText: {
      color: c.footerText,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
  });