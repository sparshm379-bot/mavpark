import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { submitReport } from '../utils/api';

const ORANGE = '#f58025';
const DARK_BG = '#0d1117';

const WALK_TIMES = {
  'Maverick Parking Garage': '3–5 min',
  'West Campus Garage': '5–8 min',
  'Park South': '8–12 min',
  'Park North': '6–9 min',
};

export default function SpotInfoSheet({ visible, spot, onClose, onReport }) {
  const [submitting, setSubmitting] = useState(false);

  if (!spot) return null;

  const latestStatus = spot.reports?.[0]?.status || 'unknown';
  const garageName = spot.floor?.garage?.name || '';
  const walkTime = WALK_TIMES[garageName] || '~5 min';

  async function report(status) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitReport(spot.id, status, null);
      Toast.show({
        type: status === 'open' ? 'success' : 'error',
        text1: status === 'open' ? 'Reported as Open' : 'Reported as Taken',
        text2: `Spot ${spot.row}${spot.number} updated`,
        visibilityTime: 2500,
      });
      onReport?.();
      onClose();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to submit', text2: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.spotId}>
          Spot {spot.row}{spot.number}
        </Text>

        <View style={styles.metaRow}>
          <MetaChip label="Permit" value={spot.permitType} />
          <MetaChip label="Walk" value={walkTime} />
          <MetaChip
            label="Status"
            value={latestStatus === 'open' ? 'Open' : latestStatus === 'taken' ? 'Taken' : '?'}
            valueColor={latestStatus === 'open' ? '#22c55e' : latestStatus === 'taken' ? '#ef4444' : '#888'}
          />
        </View>

        <Text style={styles.sectionLabel}>Report this spot</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.reportBtn, styles.openBtn]}
            onPress={() => report('open')}
            activeOpacity={0.8}
            disabled={submitting}
          >
            <Text style={styles.reportBtnText}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportBtn, styles.takenBtn]}
            onPress={() => report('taken')}
            activeOpacity={0.8}
            disabled={submitting}
          >
            <Text style={styles.reportBtnText}>Taken</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.crowdNote}>One tap updates the map for everyone</Text>
      </View>
    </Modal>
  );
}

function MetaChip({ label, value, valueColor }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#2d333b',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#2d333b',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  spotId: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  chip: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d333b',
  },
  chipLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4, fontWeight: '600' },
  chipValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  reportBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  openBtn: { backgroundColor: '#22c55e' },
  takenBtn: { backgroundColor: '#ef4444' },
  reportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  crowdNote: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' },
});
