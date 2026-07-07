import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Theme, FontFamily } from '@/constants/theme';
import { getFixtures } from '@/api/fixtures';
import type { Fixture } from '@/api/types';

export default function Fixtures() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  // Loads mock fixtures now; hits the real API once USE_MOCKS is off.
  useEffect(() => {
    getFixtures()
      .then(setFixtures)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  const unpredicted = fixtures.filter((f) => !f.predicted).length;

  return (
    <View style={styles.screen}>
      <FlatList
        data={fixtures}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 24,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.accentBar} />
              <Text style={styles.title}>Upcoming Fixtures</Text>
            </View>
            <Text style={styles.subtitle}>
              {fixtures.length} matches · {unpredicted} unpredicted
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FixtureCard
            fixture={item}
            onPredict={() =>
              router.push({ pathname: '/predict/[fixtureId]', params: { fixtureId: String(item.id) } })
            }
          />
        )}
      />
    </View>
  );
}

function FixtureCard({ fixture, onPredict }: { fixture: Fixture; onPredict: () => void }) {
  return (
    <View style={styles.card}>
      {/* Date / time + gameweek */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{fixture.date} · {fixture.time}</Text>
        <Text style={styles.week}>{fixture.week}</Text>
      </View>

      {/* Home  VS  Away */}
      <View style={styles.teams}>
        <View style={styles.team}>
          <Text style={styles.crest}>{fixture.homeCrest}</Text>
          <Text style={styles.teamName}>{fixture.home}</Text>
          <Text style={styles.teamShort}>{fixture.homeShort}</Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={styles.team}>
          <Text style={styles.crest}>{fixture.awayCrest}</Text>
          <Text style={styles.teamName}>{fixture.away}</Text>
          <Text style={styles.teamShort}>{fixture.awayShort}</Text>
        </View>
      </View>

      {/* Venue + predict action */}
      <View style={styles.footer}>
        <Text style={styles.venue} numberOfLines={1}>{fixture.venue}</Text>
        <Pressable style={styles.predictBtn} onPress={onPredict}>
          <Text style={styles.predictText}>Predict Score</Text>
          <Ionicons name="chevron-forward" size={12} color={Theme.colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  accentBar: { width: 4, height: 24, backgroundColor: Theme.colors.primary },
  title: {
    fontFamily: FontFamily.display, fontSize: 24, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  subtitle: { fontFamily: FontFamily.body, fontSize: 12, color: Theme.colors.mutedForeground, marginLeft: 12 },

  card: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Theme.colors.muted,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  bannerText: {
    fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  week: {
    fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  teams: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  team: { flex: 1, alignItems: 'center', gap: 4 },
  crest: { fontSize: 28 },
  teamName: {
    fontFamily: FontFamily.display, fontSize: 15, color: Theme.colors.foreground, textAlign: 'center',
  },
  teamShort: { fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground, letterSpacing: 1 },
  vs: { fontFamily: FontFamily.display, fontSize: 18, color: Theme.colors.mutedForeground, paddingHorizontal: 8 },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  venue: { fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground, flexShrink: 1, marginRight: 8 },
  predictBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.sm,
  },
  predictText: {
    fontFamily: FontFamily.display, fontSize: 12, color: Theme.colors.primaryForeground,
    textTransform: 'uppercase', letterSpacing: 1,
  },
});
