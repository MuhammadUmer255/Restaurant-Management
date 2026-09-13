import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  label,
}) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={{ marginBottom: 4 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8b93a7"
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Text style={styles.eye}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#fff', fontWeight: '600', marginBottom: 8 },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1626',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#26314a',
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: '#fff', paddingVertical: 14 },
  eye: { fontSize: 18 },
});