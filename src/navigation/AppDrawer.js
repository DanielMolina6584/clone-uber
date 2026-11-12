import { StyleSheet, Text, View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{driver?.personal?.fullName ?? t('nav.driver')}</Text>
        <Text style={styles.subtitle}>{t('nav.driver')}</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label={t('common.signOut')}
        labelStyle={styles.signOut}
        icon={({ size }) => <Ionicons name="log-out-outline" size={size} color={colors.texto} />}
        onPress={endSession}
      />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  const { t } = useLanguage();
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
        options={{ title: t('nav.home'), drawerIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.profile'), drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryNavigator}
        options={{ title: t('nav.history'), headerShown: false, drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: t('nav.earnings'), drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="PassengerSimulator"
        component={PassengerSimulatorScreen}
        options={{ title: t('nav.simulator'), drawerIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} /> }}
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
