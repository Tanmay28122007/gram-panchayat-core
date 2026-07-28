import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, runTransaction } from 'firebase/firestore';
import firebaseConfig from '../../firebase-config.json';
import axios from 'axios';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

/**
 * 1. The Database Push (Citizen Side)
 * Submits complaint to local server complaints.json & Cloud Firestore if configured.
 */
export async function submitComplaintToDatabase(
  citizenId: string, 
  category: string, 
  description: string, 
  locationStr: string = "Pending Verification", 
  attachments: any[] = [], 
  reporterName?: string
) {
  const payload = {
    citizen_id: citizenId || "unknown",
    reporter: reporterName || "Citizen",
    category,
    description,
    attachments,
    location: locationStr,
    status: "Pending",
    panchayatOnly: false,
    createdAt: new Date().toISOString()
  };

  // 1. Primary: Store in Local Server Database (complaints.json)
  try {
    const res = await axios.post('/api/complaints', payload);
    console.log("Success! Complaint stored in local server database (complaints.json).");
  } catch (err: any) {
    console.warn("Local server database post notice:", err.message);
  }

  // 2. Secondary: Attempt Cloud Firestore if database exists
  try {
    const counterRef = doc(db, "counters", "ticketCounter");
    const ticketId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
        transaction.update(counterRef, { count: newCount });
      } else {
        transaction.set(counterRef, { count: newCount });
      }
      return `TKT-${newCount.toString().padStart(6, '0')}`;
    });

    await addDoc(collection(db, "complaints"), {
      ...payload,
      ticketId,
      createdAt: serverTimestamp()
    });
    console.log("Success! Complaint synced to Cloud Firestore.");
  } catch (error: any) {
    console.log("Cloud Firestore not configured or uncreated yet; operating cleanly on local database.");
  }

  return true;
}

export async function updateComplaintStatus(id: string, updateData: any) {
  // Update local server database
  try {
    await axios.patch(`/api/complaints/${id}`, updateData);
  } catch (err: any) {
    console.warn("Local server complaint update notice:", err.message);
  }

  // Update Cloud Firestore if active
  try {
    const complaintRef = doc(db, "complaints", id);
    await updateDoc(complaintRef, updateData);
  } catch (error: any) {
    // Cloud Firestore notice ignored gracefully
  }
}

export function subscribeToComplaints(callback: (complaints: any[]) => void) {
  // 1. Initial & Periodic Sync from Local Server Database
  const fetchLocal = async () => {
    try {
      const { data } = await axios.get('/api/complaints');
      if (data.complaints && Array.isArray(data.complaints)) {
        callback(data.complaints);
      }
    } catch (e) {
      console.warn("Error fetching local complaints:", e);
    }
  };

  fetchLocal();
  const intervalId = setInterval(fetchLocal, 5000);

  // 2. Firestore listener if active
  try {
    const { onSnapshot, query, orderBy } = require('firebase/firestore');
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot: any) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      }
    }, (err: any) => {
      // Ignore Firestore uncreated database errors gracefully
    });

    return () => {
      clearInterval(intervalId);
      if (typeof unsub === 'function') unsub();
    };
  } catch (e) {
    return () => clearInterval(intervalId);
  }
}
