import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const FilterTab = ({ options = ['Day', 'Week', 'Month'], selectedFilter, onSelectFilter }) => {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#161D2F',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#232D42',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B00',
  },
  tabText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default FilterTab;