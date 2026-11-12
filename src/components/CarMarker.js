import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

const SIZE = 72;

// Carro visto desde arriba con el frente hacia el norte. Se rota el dibujo (no el Marker) porque
// `rotation` del Marker no se aplica en Apple Maps; el contenedor es cuadrado para que al girar no se recorte.
function CarMarker({ coordinate, heading = 0 }) {
  const angle = Math.round(heading / 2) * 2;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 150);
    return () => clearTimeout(timer);
  }, [angle]);

  return (
    <Marker
      coordinate={{ latitude: coordinate.lat, longitude: coordinate.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      accessibilityLabel="Tu carro"
    >
      <View style={[styles.box, { transform: [{ rotate: `${angle}deg` }] }]}>
        <View style={styles.shadow} />
        <View style={styles.body}>
          <View style={styles.headlights}>
            <View style={styles.headlight} />
            <View style={styles.headlight} />
          </View>
          <View style={styles.windshield} />
          <View style={styles.roof} />
          <View style={styles.rearWindow} />
          <View style={styles.taillights}>
            <View style={styles.taillight} />
            <View style={styles.taillight} />
          </View>
        </View>
      </View>
    </Marker>
  );
}

export default memo(CarMarker);

const styles = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  shadow: { position: 'absolute', width: 36, height: 58, borderRadius: 18, backgroundColor: '#00000026', top: 9, left: 18 },
  body: {
    width: 32,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFC629',
    borderWidth: 2,
    borderColor: '#1B1B1B',
    alignItems: 'center',
  },
  headlights: { flexDirection: 'row', justifyContent: 'space-between', width: 22, marginTop: 2 },
  headlight: { width: 6, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#1B1B1B' },
  windshield: { width: 22, height: 11, marginTop: 4, borderRadius: 4, backgroundColor: '#2A3A4A' },
  roof: { width: 22, height: 14, marginTop: 2, borderRadius: 3, backgroundColor: '#FFD866' },
  rearWindow: { width: 20, height: 6, marginTop: 2, borderRadius: 3, backgroundColor: '#2A3A4A' },
  taillights: { flexDirection: 'row', justifyContent: 'space-between', width: 24, marginTop: 3 },
  taillight: { width: 6, height: 3, borderRadius: 1.5, backgroundColor: '#E5352B' },
});
