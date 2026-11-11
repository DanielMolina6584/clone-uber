import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import HistoryScreen from '../screens/HistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function HistoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.fondo },
        headerTintColor: colors.texto,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'Historial', headerLeft: () => <DrawerToggleButton tintColor={colors.texto} /> }}
      />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Detalle del viaje' }} />
    </Stack.Navigator>
  );
}
