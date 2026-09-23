import React, { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  label,
  error,
  icon,
  style,
  inputStyle,
  editable = true,
  ...rest
}) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.wrap, error && styles.wrapError, !editable && styles.wrapDisabled]}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden(!hidden)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eye}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      color: c.text,
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 13,
    },
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      minHeight: 50,
    },
    wrapError: {
      borderColor: c.danger,
    },
    wrapDisabled: {
      opacity: 0.6,
      backgroundColor: c.card,
    },
    iconWrap: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: c.text,
      paddingVertical: 12,
      fontSize: 14,
    },
    eye: {
      fontSize: 18,
      paddingLeft: 8,
    },
    errorText: {
      color: c.danger,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });