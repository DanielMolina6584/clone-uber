import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

const INITIAL_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={INITIAL_REGION} showsMyLocationButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
