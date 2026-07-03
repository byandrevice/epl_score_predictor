import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme, FontFamily } from '@/constants/theme';
import { AuthField } from '@/components/AuthField';
import { register } from '@/api/auth';

// Password policy (also enforced server-side): 8+ chars with at least one letter and one number.
const PASSWORD_HINT = 'At least 8 characters, including a letter and a number.';
const isPasswordValid = (p: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p);

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError('');

    // Validate in order and surface the first problem on screen (no alert boxes).
    if (!firstName || !lastName || !username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError(PASSWORD_HINT);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ firstName, lastName, username, email, password });
      if (res.success) {
        setSuccess(res.message ?? 'Account created. Please log in.');
      } else {
        setError(res.message ?? 'Registration failed.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not connect. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>Create Account</Text>
          </View>
          <Text style={styles.subtitle}>Join the league and start predicting fixtures.</Text>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <AuthField label="First Name" value={firstName} onChangeText={setFirstName}
                  placeholder="John" autoCapitalize="words" />
              </View>
              <View style={styles.rowItem}>
                <AuthField label="Last Name" value={lastName} onChangeText={setLastName}
                  placeholder="Doe" autoCapitalize="words" />
              </View>
            </View>

            <AuthField label="Username" value={username} onChangeText={setUsername}
              placeholder="john_doe" />
            <AuthField label="Email Address" value={email} onChangeText={setEmail}
              placeholder="you@example.com" keyboardType="email-address" />

            <View>
              <AuthField label="Password" value={password} onChangeText={setPassword}
                placeholder="Create a password" secure />
              <Text style={styles.hint}>{PASSWORD_HINT}</Text>
            </View>

            <View>
              <AuthField label="Confirm Password" value={confirm} onChangeText={setConfirm}
                placeholder="Repeat password" secure />
              {confirm !== '' && password !== confirm && (
                <Text style={styles.mismatch}>Passwords do not match</Text>
              )}
            </View>

            {error !== '' && <Text style={styles.error}>{error}</Text>}
            {success !== '' && <Text style={styles.success}>{success}</Text>}

            <Pressable
              style={[styles.button, loading && { opacity: 0.5 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating…' : 'Create Account'}</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  accentBar: { width: 4, height: 26, backgroundColor: Theme.colors.primary },
  heading: {
    fontSize: 26, color: Theme.colors.foreground, fontFamily: FontFamily.display,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14, color: Theme.colors.mutedForeground, marginBottom: 28,
    lineHeight: 20, fontFamily: FontFamily.body,
  },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  hint: { color: Theme.colors.mutedForeground, fontSize: 11, marginTop: 6, fontFamily: FontFamily.body },
  mismatch: { color: Theme.colors.destructive, fontSize: 11, marginTop: 6, fontFamily: FontFamily.mono },
  error: {
    color: Theme.colors.destructive, fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1, fontFamily: FontFamily.mono,
  },
  success: { color: Theme.colors.primary, fontSize: 12, fontFamily: FontFamily.body },
  button: {
    backgroundColor: Theme.colors.primary, paddingVertical: 15,
    alignItems: 'center', borderRadius: Theme.radius.sm, marginTop: 4,
  },
  buttonText: {
    color: Theme.colors.primaryForeground, fontFamily: FontFamily.display,
    textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 15,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 28,
    paddingTop: 24, borderTopWidth: 1, borderTopColor: Theme.colors.border,
  },
  footerText: { color: Theme.colors.mutedForeground, fontSize: 14, fontFamily: FontFamily.body },
  link: { color: Theme.colors.primary, fontSize: 14, fontFamily: FontFamily.body },
});
