import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
export default function PasswordField({ style, ...rest }) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);

  return (
    <View style={{ justifyContent: 'center' }}>
      <TextInput {...rest} secureTextEntry={hidden} style={[style, { paddingRight: 44 }]} />
      <TouchableOpacity
        onPress={() => setHidden((h) => !h)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
        activeOpacity={0.7}
      >
        <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}