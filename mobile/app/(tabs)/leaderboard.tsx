import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Theme, FontFamily } from '@/constants/theme';
import { getLeaderboard } from '@/api/leaderboard';
import type { LeaderboardUser } from '@/api/types';

// Gold / silver / bronze for the top three; everyone else is muted.
const RANK_COLORS: Record<number, string> = { 1: '#fbbf24', 2: '#cbd5e1', 3: '#d97706' };

function Trend({ trend }: { trend?: LeaderboardUser['trend'] }) {
  if (trend === 'up') return <Ionicons name="caret-up" size={12} color={Theme.colors.primary} />;
  if (trend === 'down') return <Ionicons name="caret-down" size={12} color={Theme.colors.destructive} />;
  return <Ionicons name="remove" size={12} color={Theme.colors.mutedForeground} />;
}

export default function Leaderboard() {
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, search]);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(u) => String(u.rank)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={styles.accentBar} />
              <Text style={styles.title}>Leaderboard</Text>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={14} color={Theme.colors.mutedForeground} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search predictors…"
                placeholderTextColor={Theme.colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.colHead}>
              <Text style={[styles.colLabel, styles.rankCol]}>#</Text>
              <Text style={[styles.colLabel, styles.nameCol]}>Predictor</Text>
              <Text style={[styles.colLabel, styles.accCol]}>Acc</Text>
              <Text style={[styles.colLabel, styles.trendCol]}>Trd</Text>
              <Text style={[styles.colLabel, styles.ptsCol]}>Pts</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No predictors found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, styles.rankCol, { color: RANK_COLORS[item.rank] ?? Theme.colors.mutedForeground }]}>
              {item.rank}
            </Text>
            <Text style={[styles.name, styles.nameCol]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.acc, styles.accCol]}>{item.accuracy}</Text>
            <View style={[styles.trendCol, styles.trendCell]}><Trend trend={item.trend} /></View>
            <Text style={[styles.pts, styles.ptsCol]}>{item.pts.toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  accentBar: { width: 4, height: 24, backgroundColor: Theme.colors.primary },
  title: {
    fontFamily: FontFamily.display, fontSize: 24, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.muted,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.sm,
    paddingHorizontal: 12, marginTop: 16, marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, color: Theme.colors.foreground, fontFamily: FontFamily.body, fontSize: 14 },

  colHead: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  colLabel: { fontFamily: FontFamily.mono, fontSize: 9, color: Theme.colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  rank: { fontFamily: FontFamily.mono, fontSize: 13 },
  name: { fontFamily: FontFamily.body, fontSize: 14, color: Theme.colors.foreground },
  acc: { fontFamily: FontFamily.mono, fontSize: 12, color: Theme.colors.mutedForeground },
  pts: { fontFamily: FontFamily.mono, fontSize: 14, color: Theme.colors.foreground },
  trendCell: { alignItems: 'center' },

  // Column widths / alignment (shared by header + rows)
  rankCol: { width: 24, textAlign: 'center' },
  nameCol: { flex: 1 },
  accCol: { width: 40, textAlign: 'right' },
  trendCol: { width: 20, textAlign: 'center' },
  ptsCol: { width: 56, textAlign: 'right' },

  empty: {
    fontFamily: FontFamily.mono, fontSize: 12, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', paddingVertical: 40,
  },
});
