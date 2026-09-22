import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
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
      <StatusBar barStyle="light-content" backgroundColor="#070E20" />

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
        {/* Fork & Knife Badge */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🍴</Text>
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
  <ActivityIndicator size="small" color="#FF7622" style={{ marginBottom: 8 }} />
  <Text style={styles.footerText}>Initializing System...</Text>
</Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070E20',
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
    backgroundColor: '#0D162C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#202D49',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 46,
  },
  restaurantName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7622',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  description: {
    fontSize: 13,
    color: '#8D96AA',
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
    color: '#68738D',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});