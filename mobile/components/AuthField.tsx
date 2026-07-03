import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, FontFamily } from '@/constants/theme';

/**
 * AuthField — a single labeled text input used across the auth screens
 * (Login, Register). Keeps every field visually consistent and owns the
 * password show/hide behavior so screens don't each reimplement it.
 *
 * It's a "controlled" input: the parent holds the value in state and passes
 * `value` + `onChangeText` down. This component never stores the text itself.
 */
type Props = {
  label: string;                    // small uppercase caption above the input
  value: string;                    // current text (owned by the parent screen)
  onChangeText: (v: string) => void; // RN gives us the string directly (not an event)
  placeholder?: string;
  secure?: boolean;                 // true → password field: mask text + show eye toggle
  keyboardType?: KeyboardTypeOptions; // e.g. 'email-address' to get the @ keyboard
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function AuthField({
  label, value, onChangeText, placeholder,
  secure, keyboardType,
  autoCapitalize = 'none', // default off — right for email/username/password
}: Props) {
  // Local UI-only state: whether the password is currently masked.
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>

      {/* Relative container so the eye button can sit over the input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.mutedForeground}
          secureTextEntry={secure ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />

        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} style={styles.eye}>
            <Ionicons
              name={hidden ? 'eye-off' : 'eye'}
              size={18}
              color={Theme.colors.mutedForeground}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
    color: Theme.colors.mutedForeground, fontFamily: FontFamily.mono,
  },
  inputRow: { justifyContent: 'center' },
  input: {
    backgroundColor: Theme.colors.muted,
    borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16, paddingVertical: 12, paddingRight: 44,
    color: Theme.colors.foreground, fontSize: 14, fontFamily: FontFamily.body,
  },
  eye: { position: 'absolute', right: 12 },
});
