import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import HistoryScreen from '../screens/HistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function HistoryNavigator() {
  const { t } = useLanguage();
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
        options={{ title: t('nav.history'), headerLeft: () => <DrawerToggleButton tintColor={colors.texto} /> }}
      />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t('nav.tripDetail') }} />
    </Stack.Navigator>
  );
}
