import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

const BLUE = '#003865';
const ORANGE = '#f58025';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />
      <View style={styles.logoBlock}>
        <Text style={styles.appName}>MavPark</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>No reservations. No control.{'\n'}Just visibility.</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Main')}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Find parking now</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>displaying UTA parking data · not affiliated with PATS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  logoBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  appName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: ORANGE,
    borderRadius: 2,
    marginVertical: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
