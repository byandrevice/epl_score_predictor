import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

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
  // Lives here (not in the parent) because it's presentation, not form data.
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>

      {/* Relative container so the eye button can be absolutely positioned over the input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          // Required on a dark theme — the default placeholder color is nearly invisible.
          placeholderTextColor={Theme.colors.mutedForeground}
          // Only mask when this is a secure field AND the user hasn't revealed it.
          secureTextEntry={secure ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false} // don't autocorrect emails/usernames/passwords
        />

        {/* Eye toggle only renders for password fields */}
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8} // expands the tappable area beyond the small icon
            style={styles.eye}
          >
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

// No CSS cascade in RN — every element is styled explicitly via StyleSheet.
// All colors/radii come from the shared Theme so the app stays consistent.
const styles = StyleSheet.create({
  wrap: { gap: 6 }, // vertical space between label and input
  label: {
    fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
    color: Theme.colors.mutedForeground, fontWeight: '600',
  },
  inputRow: { justifyContent: 'center' }, // centers the eye vertically
  input: {
    backgroundColor: Theme.colors.muted,
    borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingRight: 44,               // reserves space so text never runs under the eye
    color: Theme.colors.foreground, fontSize: 14,
  },
  eye: { position: 'absolute', right: 12 }, // sits on top of the input, right-aligned
});
