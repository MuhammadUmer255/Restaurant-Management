import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext'; // NEW

const DashboardHeader = ({
  title = "Admin Dashboard",
  subtitle = "Welcome back, Manager",
  onExportPress,
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
}) => {
  const { colors } = useTheme(); // NEW
  const styles = useMemo(() => makeStyles(colors), [colors]); // NEW

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.onlineBadge} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {onExportPress && (
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={onExportPress}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="download-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.exportText}>Export</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.bg,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.headerBorder,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.card,
    },
    onlineBadge: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.success,
      position: 'absolute',
      bottom: 0,
      right: 0,
      borderWidth: 2,
      borderColor: c.bg,
    },
    textContainer: {
      justifyContent: 'center',
    },
    title: {
      color: c.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    subtitle: {
      color: c.muted,
      fontSize: 12,
      marginTop: 2,
    },
    exportBtn: {
      backgroundColor: c.badgeBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    exportText: {
      color: c.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

export default DashboardHeader;