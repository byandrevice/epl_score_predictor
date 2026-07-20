import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme, FontFamily } from '@/constants/theme';
import { getPredictionStats } from '@/api/predictions';
import type { PredictionResult, PredictionStatsResponse } from '@/api/types';

const RESULT_LABEL: Record<PredictionResult['result'], string> = {
  correct_score: 'Exact Score',
  correct_outcome: 'Correct Result',
  wrong: 'Wrong',
};

const RESULT_COLOR: Record<PredictionResult['result'], string> = {
  correct_score: Theme.colors.primary,
  correct_outcome: '#fbbf24', // amber — partial credit, matches leaderboard's rank-2/3 tone family
  wrong: Theme.colors.destructive,
};

function TeamInitial({ name }: { name: string }) {
  return (
    <View style={styles.teamBadge}>
      <Text style={styles.teamBadgeText}>{name.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

export default function Stats() {
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<PredictionStatsResponse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictionStats()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  const summary = data?.summary;
  // Newest results first — the API sorts oldest-to-newest.
  const results = [...(data?.predictions ?? [])].reverse();

  return (
    <View style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.accentBar} />
              <Text style={styles.title}>Prediction Results</Text>
            </View>

            {summary && (
              <View style={styles.statsGrid}>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>This Gameweek</Text>
                  <Text style={styles.statValue}>{summary.pointsThisGameweek}</Text>
                </View>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>Exact Scores</Text>
                  <Text style={styles.statValue}>{summary.correctScores}</Text>
                </View>
                <View style={styles.statTile}>
                  <Text style={styles.statLabel}>Season Accuracy</Text>
                  <Text style={styles.statValue}>{summary.seasonAccuracy}%</Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No graded predictions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {new Date(item.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {item.week}
              </Text>
              <View style={[styles.resultPill, { borderColor: RESULT_COLOR[item.result] }]}>
                <Text style={[styles.resultPillText, { color: RESULT_COLOR[item.result] }]}>
                  {RESULT_LABEL[item.result]}
                </Text>
              </View>
            </View>

            <View style={styles.matchRow}>
              <View style={styles.team}>
                <TeamInitial name={item.homeTeam} />
                <Text style={styles.teamName} numberOfLines={1}>{item.homeTeam}</Text>
              </View>

              <View style={styles.scores}>
                <Text style={styles.finalScore}>{item.finalHome}-{item.finalAway}</Text>
                <Text style={styles.finalLabel}>Final</Text>
                <Text style={styles.predScore}>{item.predHome}-{item.predAway}</Text>
                <Text style={styles.predLabel}>Your Pick</Text>
              </View>

              <View style={styles.team}>
                <TeamInitial name={item.awayTeam} />
                <Text style={styles.teamName} numberOfLines={1}>{item.awayTeam}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.venue} numberOfLines={1}>{item.venue}</Text>
              <Text style={[styles.points, { color: RESULT_COLOR[item.result] }]}>+{item.points} pts</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  accentBar: { width: 4, height: 24, backgroundColor: Theme.colors.primary },
  title: {
    fontFamily: FontFamily.display, fontSize: 24, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  statsGrid: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.lg,
    padding: 12,
  },
  statLabel: {
    fontFamily: FontFamily.mono, fontSize: 8, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  statValue: { fontFamily: FontFamily.mono, fontSize: 18, color: Theme.colors.foreground },

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
  resultPill: {
    borderWidth: 1, borderRadius: Theme.radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  resultPillText: {
    fontFamily: FontFamily.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  matchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  team: { flex: 1, alignItems: 'center', gap: 6 },
  teamBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  teamBadgeText: { fontFamily: FontFamily.mono, fontSize: 11, color: Theme.colors.mutedForeground },
  teamName: { fontFamily: FontFamily.body, fontSize: 12, color: Theme.colors.foreground, textAlign: 'center' },

  scores: { alignItems: 'center', paddingHorizontal: 8, gap: 2 },
  finalScore: { fontFamily: FontFamily.display, fontSize: 20, color: Theme.colors.foreground },
  finalLabel: {
    fontFamily: FontFamily.mono, fontSize: 8, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  predScore: { fontFamily: FontFamily.mono, fontSize: 13, color: Theme.colors.mutedForeground },
  predLabel: {
    fontFamily: FontFamily.mono, fontSize: 8, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  venue: { fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground, flexShrink: 1, marginRight: 8 },
  points: { fontFamily: FontFamily.display, fontSize: 14 },

  empty: {
    fontFamily: FontFamily.mono, fontSize: 12, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', paddingVertical: 40,
  },
});
