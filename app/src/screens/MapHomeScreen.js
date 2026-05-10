import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView, FlatList,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAppStore } from '../store';
import { getLotStatus } from '../utils/api';

const BLUE = '#003865';
const ORANGE = '#f58025';
const DARK_BG = '#0d1117';

const UTA_REGION = {
  latitude: 32.7305,
  longitude: -97.1145,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

const FILTERS = ['All', 'Garages', 'Student', 'Faculty/Staff', 'Visitor', 'General'];

const LOT_COLORS = {
  'Student Commuter':     '#3b82f6',
  'Faculty/Staff':        '#8b5cf6',
  'Student Upgrade':      '#f97316',
  'Reserved Zone':        '#ef4444',
  'Reserved Space':       '#dc2626',
  'General':              '#22c55e',
  'Visitor/Short Term':   '#10b981',
  'Reduced Rate':         '#eab308',
  'Remote Park and Ride': '#a78bfa',
  'ADA':                  '#06b6d4',
  'Motorcycle':           '#6b7280',
  'Resident':             '#f43f5e',
  'Non-UTA':              '#9ca3af',
};

function lotColor(lot) {
  return LOT_COLORS[lot.lotType] || '#6b7280';
}

function availLabel(lot) {
  if (lot.available < 0 || lot.capacity === 0) return 'Unknown';
  const pct = lot.available / lot.capacity;
  if (pct > 0.3) return 'Open';
  if (pct > 0.1) return 'Filling';
  return 'Full';
}

function availColor(lot) {
  if (lot.available < 0) return '#555';
  const pct = lot.available / lot.capacity;
  if (pct > 0.3) return '#22c55e';
  if (pct > 0.1) return '#eab308';
  return '#ef4444';
}

function matchesFilter(lot, filter) {
  if (filter === 'All') return true;
  if (filter === 'Garages') return lot.isGarage;
  if (filter === 'Student') return lot.lotType.toLowerCase().includes('student');
  if (filter === 'Faculty/Staff') return lot.lotType === 'Faculty/Staff';
  if (filter === 'Visitor') return lot.lotType.includes('Visitor');
  if (filter === 'General') return lot.lotType === 'General';
  return true;
}

export default function MapHomeScreen({ navigation }) {
  const { lotStatus, setLotStatus, setSelectedGarage } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const data = await getLotStatus();
      setLotStatus(data);
    } catch (e) {
      console.error('Lot status error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = lotStatus.filter(l => matchesFilter(l, filter));

  function openGarage(lot) {
    if (!lot.isGarage) return;
    setSelectedGarage(lot);
    navigation.navigate('GarageFloor', { garageId: lot.id, garageName: lot.name });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <MapView style={styles.map} initialRegion={UTA_REGION} userInterfaceStyle="dark">
        {filtered.map((lot) => (
          <Marker
            key={lot.id}
            coordinate={{ latitude: lot.lat, longitude: lot.lng }}
            onPress={() => setSelected(lot)}
          >
            <View style={[
              styles.markerPin,
              { backgroundColor: lotColor(lot), borderColor: availColor(lot) },
              lot.isGarage && styles.markerGarage,
            ]}>
              <Text style={styles.markerText} numberOfLines={1}>
                {lot.isGarage ? '🅿' : lot.name.replace('Lot ', '')}
              </Text>
            </View>
            <Callout onPress={() => openGarage(lot)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{lot.name}</Text>
                <Text style={styles.calloutType}>{lot.lotType}</Text>
                <Text style={[styles.calloutAvail, { color: availColor(lot) }]}>
                  {lot.available >= 0 ? `${lot.available}/${lot.capacity} open` : 'Crowdsource only'}
                </Text>
                {lot.isGarage && <Text style={styles.calloutTap}>Tap to view floors →</Text>}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appName}>MavPark</Text>
          <Text style={styles.lotCount}>{filtered.length} lots</Text>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, f === filter && styles.chipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.chipText, f === filter && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selected lot card */}
      {selected && (
        <View style={styles.selectedCard}>
          <View style={[styles.selectedStripe, { backgroundColor: lotColor(selected) }]} />
          <View style={styles.selectedBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selected.name}</Text>
              <Text style={styles.selectedType}>{selected.lotType}</Text>
            </View>
            <View style={styles.selectedRight}>
              <Text style={[styles.selectedAvail, { color: availColor(selected) }]}>
                {availLabel(selected)}
              </Text>
              {selected.available >= 0 && (
                <Text style={styles.selectedCount}>{selected.available}/{selected.capacity}</Text>
              )}
            </View>
            {selected.isGarage && (
              <TouchableOpacity style={styles.viewBtn} onPress={() => openGarage(selected)}>
                <Text style={styles.viewBtnText}>View floors</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom lot list */}
      {!selected && (
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator color={ORANGE} style={{ marginTop: 12 }} />
          ) : (
            <FlatList
              data={filtered.slice(0, 15)}
              horizontal
              keyExtractor={i => i.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.lotCard, { borderColor: lotColor(item) }]}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.lotTypeBar, { backgroundColor: lotColor(item) }]} />
                  <Text style={styles.lotCardName} numberOfLines={2}>{item.name}</Text>
                  <Text style={[styles.lotCardStatus, { color: availColor(item) }]}>
                    {availLabel(item)}
                  </Text>
                  {item.available >= 0 && (
                    <Text style={styles.lotCardCount}>{item.available}/{item.capacity}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      <Text style={styles.disclaimer}>
        {lotStatus.some(l => l.source === 'sensor') ? '● live UTA sensor data' : '● crowdsource only'} · not affiliated with PATS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  map: { flex: 1 },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,17,23,0.95)',
    paddingTop: 52, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 10,
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  lotCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: '#161b22',
    borderWidth: 1, borderColor: '#2d333b',
  },
  chipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  chipText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  markerPin: {
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
    borderWidth: 2, minWidth: 28, alignItems: 'center',
  },
  markerGarage: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  markerText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  callout: { width: 180, padding: 10 },
  calloutName: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
  calloutType: { color: '#666', fontSize: 11, marginBottom: 4 },
  calloutAvail: { fontWeight: '700', fontSize: 12, marginBottom: 2 },
  calloutTap: { color: '#999', fontSize: 10, marginTop: 4 },

  selectedCard: {
    position: 'absolute', bottom: 90, left: 12, right: 12,
    backgroundColor: '#161b22', borderRadius: 14,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: '#2d333b',
  },
  selectedStripe: { width: 4 },
  selectedBody: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  selectedName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  selectedType: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  selectedRight: { alignItems: 'flex-end' },
  selectedAvail: { fontSize: 13, fontWeight: '700' },
  selectedCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  viewBtn: {
    backgroundColor: ORANGE, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  viewBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeBtn: { padding: 14 },
  closeBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },

  listContainer: { position: 'absolute', bottom: 28, left: 0, right: 0 },
  lotCard: {
    backgroundColor: '#161b22', borderWidth: 1, borderRadius: 12,
    width: 130, overflow: 'hidden',
  },
  lotTypeBar: { height: 3, width: '100%' },
  lotCardName: { color: '#fff', fontSize: 12, fontWeight: '700', padding: 10, paddingBottom: 4 },
  lotCardStatus: { fontSize: 11, fontWeight: '600', paddingHorizontal: 10 },
  lotCardCount: { color: 'rgba(255,255,255,0.4)', fontSize: 10, padding: 10, paddingTop: 2 },

  disclaimer: {
    position: 'absolute', bottom: 10, alignSelf: 'center',
    fontSize: 10, color: 'rgba(255,255,255,0.3)',
  },
});
