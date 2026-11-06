import { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentsScreen from '../screens/DocumentsScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import { useSession } from '../context/SessionContext';
import { submitDriverRegistration } from '../services/drivers';
import { colors } from '../theme';

const Tab = createMaterialTopTabNavigator();

export default function RegistrationTabs({ onLogin }) {
  const { startSession } = useSession();
  const [registration, setRegistration] = useState({ personal: null, vehicle: null });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const saveStep = (step, data) => setRegistration((prev) => ({ ...prev, [step]: data }));

  const handleSubmit = async (documents) => {
    if (!registration.personal || !registration.vehicle) {
      setSubmitError('Completa los pasos anteriores antes de enviar');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const driverId = await submitDriverRegistration({ ...registration, documents });
      await startSession(driverId);
    } catch (error) {
      console.warn('submitDriverRegistration', error);
      setSubmitError('No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.fondo }}>
      <Tab.Navigator tabBar={() => null} screenOptions={{ swipeEnabled: false }}>
        <Tab.Screen name="PersonalData">
          {({ navigation }) => (
            <PersonalDataScreen
              onLogin={onLogin}
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
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}
