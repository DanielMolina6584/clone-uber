import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

const PICKER_OPTIONS = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 };

export default function PhotoPicker({ label, uri, onChange, error }) {
  const [permissionError, setPermissionError] = useState('');

  const pick = async (result) => {
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionError('Permite el acceso a la cámara en los ajustes del teléfono');
      return;
    }
    setPermissionError('');
    pick(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const chooseFromGallery = async () => {
    setPermissionError('');
    pick(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  const openOptions = () =>
    Alert.alert('Foto de perfil', 'Elige de dónde quieres tomar la foto', [
      { text: 'Cámara', onPress: takePhoto },
      { text: 'Galería', onPress: chooseFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  const message = error || permissionError;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.avatar, message ? styles.avatarError : null]}
        onPress={openOptions}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <Ionicons name="person" size={56} color={colors.textoDeshabilitado} />
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={18} color={colors.textoPrimario} />
        </View>
      </Pressable>
      <Text style={styles.label}>{uri ? 'Cambiar foto' : label}</Text>
      {message ? <Text style={styles.error}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarError: { borderColor: colors.error },
  image: { width: '100%', height: '100%', borderRadius: 60 },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primario,
    borderWidth: 3,
    borderColor: colors.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.etiqueta, color: colors.texto, marginTop: spacing.sm },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs, textAlign: 'center' },
});
