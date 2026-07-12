import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NumerologyReport } from './numerology';

const COLLECTION_NAME = 'numerology_reports';

export interface SavedNumerologyReport extends NumerologyReport {
  id: string;
  createdAt: string;
}

// Save or Update Report
export async function saveNumerologyReport(
  id: string | undefined,
  report: NumerologyReport
): Promise<string> {
  const reportsCollection = collection(db, COLLECTION_NAME);
  
  const docData = {
    ...report,
    updatedAt: Timestamp.now().toDate().toISOString(),
  };

  if (id) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, docData, { merge: true });
    return id;
  } else {
    const dataToSave = {
      ...docData,
      createdAt: Timestamp.now().toDate().toISOString(),
    };
    const docRef = await addDoc(reportsCollection, dataToSave);
    return docRef.id;
  }
}

// Get All Reports
export async function getNumerologyReports(): Promise<SavedNumerologyReport[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as SavedNumerologyReport));
}

// Delete Report
export async function deleteNumerologyReport(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Search Reports by name, mobile, or date
export async function searchNumerologyReports(
  searchText: string
): Promise<SavedNumerologyReport[]> {
  const allReports = await getNumerologyReports();
  const lowerSearch = searchText.toLowerCase().trim();
  
  if (!lowerSearch) {
    return allReports;
  }

  return allReports.filter((report) => {
    const nameMatch = report.name?.toLowerCase().includes(lowerSearch);
    const mobileMatch = report.mobile?.includes(lowerSearch);
    const dobMatch = report.dob?.includes(lowerSearch);
    return nameMatch || mobileMatch || dobMatch;
  });
}
