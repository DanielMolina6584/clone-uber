import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RegistrationTabs from './src/navigation/RegistrationTabs';
import { colors } from './src/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.fondo, card: colors.fondo, primary: colors.primario, text: colors.texto, border: colors.borde },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <RegistrationTabs />
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
