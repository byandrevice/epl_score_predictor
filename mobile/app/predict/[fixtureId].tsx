import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Theme, FontFamily } from '@/constants/theme';
import { getFixture } from '@/api/fixtures';
import { submitPrediction } from '@/api/predictions';
import type { Fixture } from '@/api/types';

export default function Predict() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fixture, setFixture] = useState<Fixture>();
  const [loading, setLoading] = useState(true);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getFixture(Number(fixtureId))
      .then(setFixture)
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const onlyDigits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 2);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (homeScore === '' || awayScore === '') {
      setError('Enter a score for both teams.');
      return;
    }
    if (!fixture) return;

    setSubmitting(true);
    try {
      // userId is a placeholder for now; comes from the logged-in user once the API is live.
      const res = await submitPrediction({ userId: 'guest', fixtureId: fixture.id, homeScore, awayScore });
      if (res.success) setSuccess(res.message ?? 'Prediction saved.');
      else setError(res.message ?? 'Could not save prediction.');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not connect. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  const BackButton = () => (
    <Pressable onPress={() => router.back()} style={styles.backBtn}>
      <Ionicons name="chevron-back" size={14} color={Theme.colors.mutedForeground} />
      <Text style={styles.backText}>Back to Fixtures</Text>
    </Pressable>
  );

  if (!fixture) {
    return (
      <View style={[styles.screen, styles.center, { padding: 24 }]}>
        <Text style={styles.notFound}>Fixture not found.</Text>
        <BackButton />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />

        <View style={styles.headerRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Submit Prediction</Text>
        </View>
        <Text style={styles.subtitle}>{fixture.week} · {fixture.venue}</Text>

        {/* Matchup + score inputs */}
        <View style={styles.card}>
          <View style={styles.teams}>
            <View style={styles.team}>
              <Text style={styles.crest}>{fixture.homeCrest}</Text>
              <Text style={styles.teamName}>{fixture.home}</Text>
              <Text style={styles.teamShort}>{fixture.homeShort}</Text>
              <TextInput
                style={styles.scoreInput}
                value={homeScore}
                onChangeText={(v) => setHomeScore(onlyDigits(v))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="-"
                placeholderTextColor={Theme.colors.mutedForeground}
              />
            </View>

            <Text style={styles.vs}>VS</Text>

            <View style={styles.team}>
              <Text style={styles.crest}>{fixture.awayCrest}</Text>
              <Text style={styles.teamName}>{fixture.away}</Text>
              <Text style={styles.teamShort}>{fixture.awayShort}</Text>
              <TextInput
                style={styles.scoreInput}
                value={awayScore}
                onChangeText={(v) => setAwayScore(onlyDigits(v))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="-"
                placeholderTextColor={Theme.colors.mutedForeground}
              />
            </View>
          </View>
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}
        {success !== '' && <Text style={styles.success}>{success}</Text>}

        <Pressable
          style={[styles.button, submitting && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'Saving…' : 'Submit Prediction'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 20 },
  backText: {
    fontFamily: FontFamily.mono, fontSize: 11, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  accentBar: { width: 4, height: 24, backgroundColor: Theme.colors.primary },
  title: {
    fontFamily: FontFamily.display, fontSize: 24, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  subtitle: {
    fontFamily: FontFamily.mono, fontSize: 11, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, marginLeft: 12, marginBottom: 24,
  },

  card: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    padding: 20, marginBottom: 20,
  },
  teams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  crest: { fontSize: 32 },
  teamName: { fontFamily: FontFamily.display, fontSize: 15, color: Theme.colors.foreground, textAlign: 'center' },
  teamShort: { fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground, letterSpacing: 1 },
  vs: { fontFamily: FontFamily.display, fontSize: 18, color: Theme.colors.mutedForeground, paddingHorizontal: 8 },

  scoreInput: {
    width: 64, height: 64,
    borderRadius: Theme.radius.md, borderWidth: 2, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.muted,
    color: Theme.colors.foreground, textAlign: 'center',
    fontFamily: FontFamily.display, fontSize: 30, marginTop: 4,
  },

  error: {
    color: Theme.colors.destructive, fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10, fontFamily: FontFamily.mono,
  },
  success: { color: Theme.colors.primary, fontSize: 12, marginBottom: 10, fontFamily: FontFamily.body },

  button: {
    backgroundColor: Theme.colors.primary, paddingVertical: 15,
    alignItems: 'center', borderRadius: Theme.radius.sm,
  },
  buttonText: {
    color: Theme.colors.primaryForeground, fontFamily: FontFamily.display,
    textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 15,
  },
  notFound: { color: Theme.colors.foreground, fontFamily: FontFamily.body, fontSize: 14, marginBottom: 16 },
});
