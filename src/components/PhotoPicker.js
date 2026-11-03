import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

const ASPECTS = { avatar: [1, 1], card: [4, 3] };

export default function PhotoPicker({ label, uri, onChange, error, title = 'Foto de perfil', variant = 'avatar' }) {
  const [permissionError, setPermissionError] = useState('');
  const isCard = variant === 'card';
  const pickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: ASPECTS[variant], quality: 0.7 };

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
    pick(await ImagePicker.launchCameraAsync(pickerOptions));
  };

  const chooseFromGallery = async () => {
    setPermissionError('');
    pick(await ImagePicker.launchImageLibraryAsync(pickerOptions));
  };

  const openOptions = () =>
    Alert.alert(title, 'Elige de dónde quieres tomar la foto', [
      { text: 'Cámara', onPress: takePhoto },
      { text: 'Galería', onPress: chooseFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  const message = error || permissionError;

  return (
    <View style={[styles.container, isCard ? styles.containerCard : null]}>
      {isCard ? <Text style={styles.cardLabel}>{title}</Text> : null}
      <Pressable
        style={[isCard ? styles.card : styles.avatar, message ? styles.avatarError : null]}
        onPress={openOptions}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {uri ? (
          <Image source={{ uri }} style={isCard ? styles.cardImage : styles.image} />
        ) : (
          <Ionicons name={isCard ? 'image-outline' : 'person'} size={isCard ? 40 : 56} color={colors.textoDeshabilitado} />
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={18} color={colors.textoPrimario} />
        </View>
      </Pressable>
      <Text style={[styles.label, isCard ? styles.labelCard : null]}>{uri ? 'Cambiar foto' : label}</Text>
      {message ? <Text style={[styles.error, isCard ? styles.errorCard : null]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: spacing.lg },
  containerCard: { alignItems: 'stretch', marginBottom: spacing.md },
  cardLabel: { ...typography.etiqueta, color: colors.texto, marginBottom: spacing.sm },
  card: {
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%' },
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
  labelCard: { ...typography.error, color: colors.textoSecundario, fontWeight: '400' },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs, textAlign: 'center' },
  errorCard: { textAlign: 'left' },
});
