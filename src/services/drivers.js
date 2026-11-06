import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
