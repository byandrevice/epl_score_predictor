import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import { Theme, FontFamily } from '@/constants/theme';
import { AuthField } from '@/components/AuthField';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

/**
 * Login screen (route: /(auth)/login)
 * 
 * Flow : user enters credentials -> login() hits API ->
 * on success we hand the JWT to AuthContext via SignIn(), which flips the
 * auth gate in app/_layout.tsx and shows the tabs.
 */

export default function Login() {
  const router = useRouter(); // open Register screen

  const insets = useSafeAreaInsets(); // safe padding

  const { signIn } = useAuth(); // triggers auth redirect 

  const [identity, setIdentity] = useState(''); // email OR username (API field: "identity")

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false); // disable the button & shows "Verifying" state

  const [error, setError] = useState(''); 

  const handleLogin = async () => {
    setError(''); // clear any previous error with each attempt

    // client side guard
    if (!identity || !password) {
      setError('Enter your username/email and password');
      return;
    }

    setLoading(true);
    try {

      const res = await login({ identity, password });

      if (res.token) {
        signIn(res.token) // success -> store token -> gate shows tabs
      }
      else {
        setError(res.message ?? 'Login failed.');
      }
    } catch (e: any) {
      // Network/HTTP errors
      setError(e?.response?.data?.message ?? 'Could not connect. Try again');
    } finally {
      setLoading(false); // re-enable button
    }
  };

  return (
    // Pushes content up so the keyboard doesn't cover the inputs (iOS needs 'padding').
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ScrollView keeps the form reachable on short screens / with the keyboard open. */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled" // let taps hit buttons while the keyboard is up
      >
        <View style={styles.card}>
          {/* Header: green accent bar + uppercase title (matches the web design) */}
          <View style={styles.headerRow}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>Welcome Back</Text>
          </View>
          <Text style={styles.subtitle}>
            Log in to your account and get back to predicting.
          </Text>

          {/* Form fields (AuthField owns the label + password eye toggle) */}
          <View style={styles.form}>
            <AuthField
              label="Email or Username"
              value={identity}
              onChangeText={setIdentity}
              placeholder="you@example.com or username"
              keyboardType="email-address"
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secure // masks input + adds the eye toggle
            />

            {/* Error renders only when set — conditional && is the RN idiom for this */}
            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.forgot} onPress={() => { /* TODO: forgot-password flow */ }}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {/* Primary action. Disabled while a request is in flight. */}
            <Pressable
              style={[styles.button, loading && { opacity: 0.5 }]} // array = merge styles
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Verifying…' : 'Log In'}</Text>
            </Pressable>
          </View>

          {/* Footer link to Register (normal navigation, not auth) */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>No account yet? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.link}>Sign up for free</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// No CSS cascade in RN — every element is styled explicitly. Colors come from Theme.
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.colors.background },
  // flexGrow:1 + justifyContent:center vertically centers the form inside the ScrollView.
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 360, alignSelf: 'center' }, // caps width on tablets
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  accentBar: { width: 4, height: 26, backgroundColor: Theme.colors.primary }, // the green tick
  heading: {
    fontSize: 26, fontFamily: FontFamily.display, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  subtitle: { fontSize: 14, color: Theme.colors.mutedForeground, marginBottom: 28, lineHeight: 20, fontFamily: FontFamily.body },
  form: { gap: 16 }, // consistent spacing between fields/buttons
  error: { color: Theme.colors.destructive, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontFamily: FontFamily.mono },
  forgot: { alignSelf: 'flex-end' }, // right-align just this row
  forgotText: { color: Theme.colors.primary, fontSize: 13, fontFamily: FontFamily.body },
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

