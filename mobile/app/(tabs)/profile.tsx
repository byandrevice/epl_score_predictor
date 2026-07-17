import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Theme, FontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getProfile, getStats } from '@/api/user';
import type { UserProfile, UserStats } from '@/api/types';

function Detail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile>();
  const [stats, setStats] = useState<UserStats>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProfile(), getStats()])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch((e: any) => setError(e?.response?.data?.message ?? 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  if (error !== '' || !profile || !stats) {
    return (
      <View style={[styles.screen, styles.center, { padding: 24, gap: 16 }]}>
        <Text style={styles.errorText}>{error || 'Could not load profile.'}</Text>
        <Pressable style={styles.signOut} onPress={signOut}>
          <Ionicons name="log-out-outline" size={16} color={Theme.colors.destructive} />
          <Text style={styles.signOutText}>Log Out</Text>
        </Pressable>
      </View>
    );
  }

  const initials = (profile.firstName[0] ?? 'U').toUpperCase();
  const statTiles = [
    { label: 'Rank', value: typeof stats.rank === 'number' ? `#${stats.rank}` : stats.rank },
    { label: 'Points', value: String(stats.points) },
    { label: 'Accuracy', value: stats.accuracy },
    { label: 'Correct Scores', value: String(stats.correctScores) },
    { label: 'Streak', value: stats.streak },
    { label: 'Predictions Made', value: String(stats.predictionsMade) },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {statTiles.map((s) => (
          <View key={s.label} style={styles.statTile}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Personal details (read-only) */}
      <Text style={styles.sectionTitle}>Personal Details</Text>
      <View style={styles.card}>
        <Detail label="First Name" value={profile.firstName} />
        <Detail label="Last Name" value={profile.lastName} />
        <Detail label="Username" value={profile.username} />
        <Detail label="Email" value={profile.email} />
        <Detail
          label="Member Since"
          value={new Date(profile.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          last={profile.favoriteTeam === ''}
        />
        {profile.favoriteTeam !== '' && (
          <Detail label="Favorite Team" value={profile.favoriteTeam} last />
        )}
      </View>

      {/* Sign out */}
      <Pressable style={styles.signOut} onPress={signOut}>
        <Ionicons name="log-out-outline" size={16} color={Theme.colors.destructive} />
        <Text style={styles.signOutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  errorText: {
    color: Theme.colors.destructive, fontSize: 13, textAlign: 'center',
    fontFamily: FontFamily.mono, textTransform: 'uppercase', letterSpacing: 1,
  },

  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.lg,
    padding: 20, marginBottom: 16,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 1, borderColor: 'rgba(57, 255, 20, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.display, fontSize: 22, color: Theme.colors.primary },
  heroText: { flex: 1 },
  name: {
    fontFamily: FontFamily.display, fontSize: 22, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  username: {
    fontFamily: FontFamily.mono, fontSize: 11, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  statTile: {
    width: '48%', marginBottom: 12,
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.lg,
    padding: 16,
  },
  statLabel: {
    fontFamily: FontFamily.mono, fontSize: 9, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  statValue: { fontFamily: FontFamily.mono, fontSize: 22, color: Theme.colors.foreground },

  sectionTitle: {
    fontFamily: FontFamily.display, fontSize: 14, color: Theme.colors.foreground,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.lg,
    paddingHorizontal: 16, marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  detailLabel: {
    fontFamily: FontFamily.mono, fontSize: 10, color: Theme.colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  detailValue: { fontFamily: FontFamily.body, fontSize: 14, color: Theme.colors.foreground, flexShrink: 1, textAlign: 'right', marginLeft: 12 },

  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(224, 62, 62, 0.4)', borderRadius: Theme.radius.sm,
    paddingVertical: 14,
  },
  signOutText: {
    fontFamily: FontFamily.display, fontSize: 14, color: Theme.colors.destructive,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
});
