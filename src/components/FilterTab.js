import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const FilterTab = ({ options = ['Day', 'Week', 'Month'], selectedFilter, onSelectFilter }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = selectedFilter === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelectFilter(option)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: 10,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: c.primary,
    },
    tabText: {
      color: c.muted,
      fontSize: 13,
      fontWeight: '600',
    },
    activeTabText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });

export default FilterTab;