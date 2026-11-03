// AI-assisted: see BITACORA.md #011
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Subida sin firma (unsigned upload preset): no requiere la API secret en la app.
export async function uploadImage(uri, folder) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary no está configurado en .env');

  const body = new FormData();
  body.append('file', { uri, type: 'image/jpeg', name: `${Date.now()}.jpg` });
  body.append('upload_preset', UPLOAD_PRESET);
  if (folder) body.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body });
  if (!response.ok) throw new Error(`Cloudinary respondió ${response.status}`);
  const data = await response.json();
  return data.secure_url;
}
