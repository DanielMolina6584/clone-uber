import { arrayUnion, collection, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export const TRIP_STATUS = {
  requested: 'requested',
  accepted: 'accepted',
};

const tripRef = (tripId) => doc(db, 'trips', tripId);

export function subscribeRequestedTrips(onData, onError) {
  return onSnapshot(
    query(collection(db, 'trips'), where('status', '==', TRIP_STATUS.requested)),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError
  );
}

// Transacción: si otro conductor ya tomó la solicitud, falla con 'trip-taken'
export function acceptTrip(tripId, driverId) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef(tripId));
    if (!snapshot.exists() || snapshot.data().status !== TRIP_STATUS.requested || snapshot.data().driverId) {
      throw new Error('trip-taken');
    }
    transaction.update(tripRef(tripId), { driverId, status: TRIP_STATUS.accepted, acceptedAt: serverTimestamp() });
  });
}

// El viaje sigue en 'requested' para que lo vea otro conductor; este conductor queda excluido
export function rejectTrip(tripId, driverId) {
  return updateDoc(tripRef(tripId), { rejectedBy: arrayUnion(driverId) });
}
