import { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentsScreen from '../screens/DocumentsScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import { colors } from '../theme';

const Tab = createMaterialTopTabNavigator();

export default function RegistrationTabs() {
  const [registration, setRegistration] = useState({ personal: null, vehicle: null });

  const saveStep = (step, data) => setRegistration((prev) => ({ ...prev, [step]: data }));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.fondo }}>
      <Tab.Navigator tabBar={() => null} screenOptions={{ swipeEnabled: false }}>
        <Tab.Screen name="PersonalData">
          {({ navigation }) => (
            <PersonalDataScreen
              onContinue={(data) => {
                saveStep('personal', data);
                navigation.navigate('Vehicle');
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Vehicle">
          {({ navigation }) => (
            <VehicleScreen
              onBack={() => navigation.navigate('PersonalData')}
              onContinue={(data) => {
                saveStep('vehicle', data);
                navigation.navigate('Documents');
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Documents">
          {({ navigation }) => (
            <DocumentsScreen
              vehicleYear={registration.vehicle?.year}
              onBack={() => navigation.navigate('Vehicle')}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}
