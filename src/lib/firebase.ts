import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, runTransaction } from 'firebase/firestore';
import firebaseConfig from '../../firebase-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

/**
 * 1. The Database Push (Citizen Side)
 * Submits the structured complaint to the global complaints cloud database.
 */
export async function submitComplaintToDatabase(citizenId: string, category: string, description: string, locationStr: string = "Pending Verification", attachments: any[] = [], reporterName?: string) {
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

    const payload = {
      ticketId,
      event: "LODGE_COMPLAINT",
      citizen_id: citizenId || "unknown",
      reporter: reporterName || "Citizen",
      category,
      description,
      attachments,
      location: locationStr,
      status: "Pending",
      panchayatOnly: false,
      createdAt: serverTimestamp() // Set precise creation time on the server
    };
    
    await addDoc(collection(db, "complaints"), payload);
    console.log("Success! Complaint data is now in the global database cloud.");
    return true;
  } catch (error: any) {
    console.error("Database storage failed. Check your connection setup:", error.message);
    throw error;
  }
}

export async function updateComplaintStatus(id: string, updateData: any) {
  try {
    const complaintRef = doc(db, "complaints", id);
    await updateDoc(complaintRef, updateData);
    console.log("Success! Complaint updated in the cloud database.");
  } catch (error: any) {
    console.error("Failed to update complaint:", error.message);
  }
}

export function subscribeToComplaints(callback: (complaints: any[]) => void) {
  const { onSnapshot, query, orderBy } = require('firebase/firestore');
  const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot: any) => {
    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
}
