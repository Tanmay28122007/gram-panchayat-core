import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc,
  runTransaction, onSnapshot, setDoc, getDocs, where, query 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-config.json';
import axios from 'axios';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

/**
 * 1. COMPLAINTS SYNC (Global real-time sync across all laptops/devices)
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
    attachments: attachments || [],
    location: locationStr,
    status: "Pending",
    panchayatOnly: false,
    createdAt: new Date().toISOString()
  };

  // 1. Primary: Store in Local Server Database (complaints.json) if available
  try {
    await axios.post('/api/complaints', payload);
  } catch (err: any) {}

  // 2. Cloud Firestore (Global Real-time Sync across laptops)
  let ticketId = `TKT-${Math.floor(Math.random() * 900000 + 100000)}`;
  try {
    const counterRef = doc(db, "counters", "ticketCounter");
    ticketId = await runTransaction(db, async (transaction) => {
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
  } catch (e) {
    // Transaction counter fallback
  }

  try {
    await addDoc(collection(db, "complaints"), {
      ...payload,
      ticketId,
      createdAt: serverTimestamp()
    });
    console.log("Complaint successfully synced to Cloud Firestore.");
  } catch (error: any) {
    console.warn("Cloud Firestore complaint push notice:", error);
  }

  return true;
}

export async function updateComplaintStatus(id: string, updateData: any) {
  try {
    await axios.patch(`/api/complaints/${id}`, updateData);
  } catch (err: any) {}

  try {
    if (id && !id.startsWith('TKT-')) {
      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, updateData);
    } else {
      const q = query(collection(db, "complaints"), where("ticketId", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, "complaints", document.id), updateData);
      });
    }
  } catch (error: any) {
    console.warn("Cloud Firestore complaint status update notice:", error);
  }
}

export function subscribeToComplaints(callback: (complaints: any[]) => void) {
  try {
    const colRef = collection(db, "complaints");
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const complaints = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }));
        complaints.sort((a: any, b: any) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        callback(complaints);
      }
    }, (err) => {
      console.warn("Firestore complaints snapshot notice:", err);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * 2. PROJECTS SYNC (Global real-time sync across all laptops)
 */
export async function submitProjectToDatabase(project: any) {
  try {
    await axios.post('/api/projects', project);
  } catch (e) {}

  try {
    const projRef = doc(db, "projects", project.id);
    await setDoc(projRef, {
      ...project,
      updatedAt: serverTimestamp()
    });
    console.log("Project successfully synced to Cloud Firestore.");
  } catch (e) {
    console.warn("Firestore project sync notice:", e);
  }
}

export async function updateProjectInDatabase(id: string, updateData: any) {
  try {
    await axios.put(`/api/projects/${id}`, updateData);
  } catch (e) {}

  try {
    const projRef = doc(db, "projects", id);
    await updateDoc(projRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (e) {}
}

export async function deleteProjectFromDatabase(id: string) {
  try {
    await axios.delete(`/api/projects/${id}`);
  } catch (e) {}

  try {
    const projRef = doc(db, "projects", id);
    await deleteDoc(projRef);
  } catch (e) {}
}

export function subscribeToProjects(callback: (projects: any[]) => void) {
  try {
    const colRef = collection(db, "projects");
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const projects = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }));
        projects.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(projects);
      }
    }, (err) => {
      console.warn("Firestore projects snapshot notice:", err);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * 3. FINANCE LEDGER & BUDGET SYNC (Global real-time sync across all laptops)
 */
export async function submitExpenseToDatabase(expense: any) {
  try {
    await axios.post('/api/ledger', expense);
  } catch (e) {}

  try {
    const expRef = doc(db, "ledger", expense.id);
    await setDoc(expRef, {
      ...expense,
      updatedAt: serverTimestamp()
    });
    console.log("Expense successfully synced to Cloud Firestore.");
  } catch (e) {
    console.warn("Firestore expense sync notice:", e);
  }
}

export async function deleteExpenseFromDatabase(id: string) {
  try {
    await axios.delete(`/api/ledger/${id}`);
  } catch (e) {}

  try {
    const expRef = doc(db, "ledger", id);
    await deleteDoc(expRef);
  } catch (e) {}
}

export function subscribeToLedger(callback: (ledger: any[]) => void) {
  try {
    const colRef = collection(db, "ledger");
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const ledger = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }));
        ledger.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        callback(ledger);
      }
    }, (err) => {
      console.warn("Firestore ledger snapshot notice:", err);
    });
  } catch (e) {
    return () => {};
  }
}

export async function updateVillageBudgetInDatabase(totalFund: number) {
  try {
    const authHeader = localStorage.getItem('sarpanch_token');
    await axios.put('/api/village-budget', { totalFund }, {
      headers: authHeader ? { Authorization: `Bearer ${authHeader}` } : {}
    });
  } catch (e) {}

  try {
    const budgetRef = doc(db, "settings", "budget");
    await setDoc(budgetRef, { totalFund, updatedAt: serverTimestamp() });
  } catch (e) {}
}

export function subscribeToBudget(callback: (totalFund: number) => void) {
  try {
    const budgetRef = doc(db, "settings", "budget");
    return onSnapshot(budgetRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().totalFund) {
        callback(snapshot.data().totalFund);
      }
    });
  } catch (e) {
    return () => {};
  }
}
