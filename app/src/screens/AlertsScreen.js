import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAppStore } from '../store';

const ORANGE = '#f58025';
const DARK_BG = '#0d1117';

export default function AlertsScreen() {
  const { lotStatus, alerts, toggleAlert } = useAppStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>Get notified when a lot opens up</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Notify me when available</Text>

        {lotStatus.length === 0 && (
          <Text style={styles.emptyText}>Load the map first to see lots here.</Text>
        )}

        {lotStatus.map((lot) => (
          <View key={lot.id} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.lotName}>{lot.name}</Text>
              <Text style={styles.lotCount}>{lot.open}/{lot.total} open</Text>
            </View>
            <Switch
              value={!!alerts[lot.id]}
              onValueChange={() => toggleAlert(lot.id)}
              trackColor={{ false: '#2d333b', true: ORANGE }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={styles.feedHeader}>
          <Text style={styles.sectionLabel}>Recent activity</Text>
        </View>

        <View style={styles.feedCard}>
          <Text style={styles.feedEmpty}>No alerts yet. Toggle a lot above to start monitoring.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 },
  content: { padding: 20, gap: 10 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  row: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2d333b',
  },
  rowInfo: { flex: 1 },
  lotName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  lotCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  feedHeader: { marginTop: 12 },
  feedCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d333b',
    alignItems: 'center',
  },
  feedEmpty: { color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginTop: 8 },
});
