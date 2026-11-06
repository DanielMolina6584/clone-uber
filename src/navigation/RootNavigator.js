import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import LoginScreen from '../screens/LoginScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import { colors } from '../theme';
import RegistrationTabs from './RegistrationTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { driverId, driver, loading, endSession } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.texto} size="large" />
      </View>
    );
  }

  if (driverId && driver) {
    return <PendingApprovalScreen name={driver.personal?.fullName?.split(' ')[0]} status={driver.status} onSignOut={endSession} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Registration">{({ navigation }) => <RegistrationTabs onLogin={() => navigation.navigate('Login')} />}</Stack.Screen>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fondo },
});
