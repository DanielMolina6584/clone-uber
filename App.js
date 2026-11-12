import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { SessionProvider, useSession } from './src/context/SessionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.fondo, card: colors.fondo, primary: colors.primario, text: colors.texto, border: colors.borde },
};

// Cuando hay sesión, el idioma guardado en el perfil del conductor manda sobre el de AsyncStorage
function LanguageSync() {
  const { driver } = useSession();
  const { setLanguage } = useLanguage();
  const stored = driver?.personal?.language;

  useEffect(() => {
    if (stored) setLanguage(stored);
  }, [stored, setLanguage]);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SessionProvider>
          <LanguageSync />
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </SessionProvider>
      </LanguageProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
