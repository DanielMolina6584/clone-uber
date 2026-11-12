import { StyleSheet, Text, View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import EarningsScreen from '../screens/EarningsScreen';
import MapScreen from '../screens/MapScreen';
import PassengerSimulatorScreen from '../screens/PassengerSimulatorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, spacing, typography } from '../theme';
import HistoryNavigator from './HistoryNavigator';

const Drawer = createDrawerNavigator();

function DrawerContent(props) {
  const { driver, endSession } = useSession();
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{driver?.personal?.fullName ?? 'Conductor'}</Text>
        <Text style={styles.subtitle}>Conductor</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar sesión"
        labelStyle={styles.signOut}
        icon={({ size }) => <Ionicons name="log-out-outline" size={size} color={colors.texto} />}
        onPress={endSession}
      />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.fondo },
        headerTintColor: colors.texto,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        drawerActiveTintColor: colors.textoPrimario,
        drawerActiveBackgroundColor: colors.primario,
        drawerInactiveTintColor: colors.texto,
      }}
    >
      <Drawer.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Inicio', drawerIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryNavigator}
        options={{ title: 'Historial', headerShown: false, drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Ganancias', drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="PassengerSimulator"
        component={PassengerSimulatorScreen}
        options={{ title: 'Simulador de pasajero', drawerIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} /> }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, marginBottom: spacing.sm },
  name: { ...typography.etiqueta, fontSize: 18, color: colors.texto },
  subtitle: { ...typography.error, color: colors.textoSecundario, marginTop: spacing.xs },
  signOut: { color: colors.texto, fontWeight: '600' },
});
