import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PersonalDataScreen from './src/screens/PersonalDataScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PersonalDataScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
