import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import { colors } from '../theme';

const Tab = createMaterialTopTabNavigator();

export default function RegistrationTabs() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.fondo }}>
      <Tab.Navigator tabBar={() => null} screenOptions={{ swipeEnabled: false }}>
        <Tab.Screen name="PersonalData">
          {({ navigation }) => <PersonalDataScreen onContinue={() => navigation.navigate('Vehicle')} />}
        </Tab.Screen>
        <Tab.Screen name="Vehicle">
          {({ navigation }) => <VehicleScreen onBack={() => navigation.navigate('PersonalData')} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}
