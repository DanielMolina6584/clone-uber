import { addDoc, collection, doc, getDocs, limit, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export const DRIVER_STATUS = { pending: 'pending_approval', approved: 'approved' };

export async function submitDriverRegistration({ personal, vehicle, documents }) {
  const ref = await addDoc(collection(db, 'drivers'), {
    personal,
    vehicle,
    documents,
    status: DRIVER_STATUS.pending,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeDriver(driverId, onData, onError) {
  return onSnapshot(
    doc(db, 'drivers', driverId),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError
  );
}

// Sin Firebase Auth: el documento de identidad hace de "usuario" para reabrir la sesión
export async function findDriverByIdNumber(idNumber) {
  const snapshot = await getDocs(query(collection(db, 'drivers'), where('personal.idNumber', '==', idNumber), limit(1)));
  return snapshot.empty ? null : snapshot.docs[0].id;
}

export function setDriverAvailability(driverId, isAvailable) {
  return updateDoc(doc(db, 'drivers', driverId), { isAvailable });
}

// La app del pasajero escucha este documento para ver al conductor
export function updateDriverLocation(driverId, { lat, lng, heading }) {
  return updateDoc(doc(db, 'drivers', driverId), { location: { lat, lng, heading }, locationUpdatedAt: serverTimestamp() });
}

export function updateDriverProfile(driverId, fields) {
  return updateDoc(doc(db, 'drivers', driverId), fields);
}
