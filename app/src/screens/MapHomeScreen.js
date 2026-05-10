import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useAppStore } from '../store';
import { getLotStatus } from '../utils/api';

const BLUE = '#003865';
const ORANGE = '#f58025';
const DARK_BG = '#0d1117';

const UTA_REGION = {
  latitude: 32.7299,
  longitude: -97.1155,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function lotColor(lot) {
  if (!lot.total) return '#555';
  const ratio = lot.open / lot.total;
  if (ratio > 0.4) return '#22c55e';
  if (ratio > 0.15) return '#eab308';
  return '#ef4444';
}

function lotLabel(lot) {
  if (!lot.total) return 'Unknown';
  const ratio = lot.open / lot.total;
  if (ratio > 0.4) return 'Open';
  if (ratio > 0.15) return 'Filling Up';
  return 'Full';
}

export default function MapHomeScreen({ navigation }) {
  const { lotStatus, setLotStatus, setSelectedGarage } = useAppStore();
  const [loading, setLoading] = React.useState(true);

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
      console.error('Failed to fetch lot status', e.message);
    } finally {
      setLoading(false);
    }
  }

  function openGarage(lot) {
    setSelectedGarage(lot);
    navigation.navigate('GarageFloor', { garageId: lot.id, garageName: lot.name });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <MapView style={styles.map} initialRegion={UTA_REGION} userInterfaceStyle="dark">
        {lotStatus.map((lot) => (
          <React.Fragment key={lot.id}>
            <Circle
              center={{ latitude: lot.lat, longitude: lot.lng }}
              radius={80}
              fillColor={lotColor(lot) + '55'}
              strokeColor={lotColor(lot)}
              strokeWidth={2}
            />
            <Marker
              coordinate={{ latitude: lot.lat, longitude: lot.lng }}
              onPress={() => openGarage(lot)}
            >
              <View style={[styles.markerBubble, { borderColor: lotColor(lot) }]}>
                <Text style={styles.markerName}>{lot.name.split(' ')[0]}</Text>
                <Text style={[styles.markerStatus, { color: lotColor(lot) }]}>
                  {lotLabel(lot)}
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>MavPark</Text>
        <View style={styles.legendRow}>
          {[['#22c55e', 'Open'], ['#eab308', 'Filling'], ['#ef4444', 'Full']].map(([c, l]) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.lotList}>
        <Text style={styles.lotListHeader}>All Lots</Text>
        {loading ? (
          <ActivityIndicator color={ORANGE} style={{ marginTop: 12 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {lotStatus.map((lot) => (
              <TouchableOpacity
                key={lot.id}
                style={[styles.lotCard, { borderColor: lotColor(lot) }]}
                onPress={() => openGarage(lot)}
                activeOpacity={0.8}
              >
                <Text style={styles.lotCardName}>{lot.name}</Text>
                <Text style={[styles.lotCardStatus, { color: lotColor(lot) }]}>
                  {lotLabel(lot)}
                </Text>
                <Text style={styles.lotCardCount}>
                  {lot.open}/{lot.total} open
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <Text style={styles.disclaimer}>displaying UTA parking data · not affiliated with PATS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(13,17,23,0.9)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  markerBubble: {
    backgroundColor: '#0d1117',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  markerName: { color: '#fff', fontSize: 11, fontWeight: '700' },
  markerStatus: { fontSize: 10, fontWeight: '600' },
  lotList: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingLeft: 16,
    paddingBottom: 8,
  },
  lotListHeader: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8 },
  lotCard: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
  },
  lotCardName: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  lotCardStatus: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  lotCardCount: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  disclaimer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
});
