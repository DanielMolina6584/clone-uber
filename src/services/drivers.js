// AI-assisted: see BITACORA.md #011
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage } from './cloudinary';

export const DRIVER_STATUS = { pending: 'pending_approval', approved: 'approved' };

const PHOTO_FIELDS = [
  ['personal', 'photoUri', 'photoUrl'],
  ['vehicle', 'vehiclePhotoUri', 'vehiclePhotoUrl'],
  ['documents', 'licensePhotoUri', 'licensePhotoUrl'],
  ['documents', 'soatPhotoUri', 'soatPhotoUrl'],
  ['documents', 'techInspectionPhotoUri', 'techInspectionPhotoUrl'],
];

export async function submitDriverRegistration({ personal, vehicle, documents }) {
  const sections = { personal: { ...personal }, vehicle: { ...vehicle }, documents: { ...documents } };

  await Promise.all(
    PHOTO_FIELDS.map(async ([section, uriField, urlField]) => {
      const uri = sections[section][uriField];
      delete sections[section][uriField];
      sections[section][urlField] = uri ? await uploadImage(uri, `drivers/${section}`) : null;
    })
  );

  const ref = await addDoc(collection(db, 'drivers'), {
    ...sections,
    status: DRIVER_STATUS.pending,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
