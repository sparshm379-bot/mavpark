import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useAppStore } from '../store';
import { getGarageFloors } from '../utils/api';
import SpotInfoSheet from '../components/SpotInfoSheet';

const BLUE = '#003865';
const ORANGE = '#f58025';
const DARK_BG = '#0d1117';

function spotColor(spot) {
  const latest = spot.reports?.[0];
  if (!latest) return '#2d333b';
  return latest.status === 'open' ? '#22c55e' : '#ef4444';
}

export default function GarageFloorScreen({ route, navigation }) {
  const { garageId, garageName } = route.params;
  const { floors, setFloors, selectedFloor, setSelectedFloor } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    setSelectedFloor(0);
    loadFloors();
  }, [garageId]);

  async function loadFloors() {
    try {
      const data = await getGarageFloors(garageId);
      setFloors(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openSpot(spot) {
    setSelectedSpot(spot);
    setSheetVisible(true);
  }

  const currentFloor = floors[selectedFloor];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.garageName}>{garageName}</Text>
          <Text style={styles.garageSubtitle}>Tap a spot to report</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={ORANGE} style={{ marginTop: 60 }} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            <View style={styles.tabs}>
              {floors.map((f, idx) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.tab, idx === selectedFloor && styles.tabActive]}
                  onPress={() => setSelectedFloor(idx)}
                >
                  <Text style={[styles.tabText, idx === selectedFloor && styles.tabTextActive]}>
                    L{f.level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={styles.floorScroll} contentContainerStyle={styles.floorContent}>
            {currentFloor?.spots && groupByRow(currentFloor.spots).map(([row, spots]) => (
              <View key={row} style={styles.rowBlock}>
                <Text style={styles.rowLabel}>Row {row}</Text>
                <View style={styles.spotsRow}>
                  {spots.map((spot) => (
                    <TouchableOpacity
                      key={spot.id}
                      style={[styles.spot, { backgroundColor: spotColor(spot) }]}
                      onPress={() => openSpot(spot)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.spotText}>{spot.number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.legend}>
            {[['#22c55e', 'Open'], ['#ef4444', 'Taken'], ['#2d333b', 'Unknown']].map(([c, l]) => (
              <View key={l} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c }]} />
                <Text style={styles.legendText}>{l}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <SpotInfoSheet
        visible={sheetVisible}
        spot={selectedSpot}
        onClose={() => setSheetVisible(false)}
        onReport={() => loadFloors()}
      />
    </View>
  );
}

function groupByRow(spots) {
  const map = {};
  for (const s of spots) {
    if (!map[s.row]) map[s.row] = [];
    map[s.row].push(s);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161b22',
    borderRadius: 8,
  },
  backArrow: { color: '#fff', fontSize: 20 },
  garageName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  garageSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },
  tabsScroll: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#2d333b',
  },
  tabActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  tabText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  floorScroll: { flex: 1 },
  floorContent: { padding: 16, gap: 20 },
  rowBlock: { gap: 8 },
  rowLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  spotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spot: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
});
