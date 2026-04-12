import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from '../lib/firebase';
import { rawTeachers, rawLeaveTypes } from '../constants/data';

export function useFirebaseData(showToast) {
  const [user, setUser] = useState(null);
  const [teachersList, setTeachersList] = useState(rawTeachers);
  const [leaveTypesList, setLeaveTypesList] = useState(rawLeaveTypes);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [baselineCuti, setBaselineCuti] = useState({});
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        setIsSyncing(false);
      }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);

    const teachersRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'teachers_list');
    const unsubTeachers = onSnapshot(teachersRef, (snap) => {
      if (snap.exists()) setTeachersList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawTeachers });
      setIsSyncing(false);
    });

    const leavesRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'leave_types');
    const unsubLeaves = onSnapshot(leavesRef, (snap) => {
      if (snap.exists()) setLeaveTypesList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawLeaveTypes });
    });

    const baselineRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'baseline_cuti');
    const unsubBaseline = onSnapshot(baselineRef, (snap) => {
      if (snap.exists()) setBaselineCuti(snap.data().data || {});
      else setDoc(snap.ref, { data: {} });
    });

    const qHistory = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setHistoryRecords(sorted);
    });

    return () => {
      unsubTeachers();
      unsubLeaves();
      unsubBaseline();
      unsubHistory();
    };
  }, [user]);

  const updateConfigList = (col, newList) => {
    if (!user) {
      showToast("❌ 请先连接云端！");
      return;
    }
    setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', col), { list: newList });
  };

  const saveBaselineData = async (newData) => {
    if (!user) return false;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'baseline_cuti'), { data: newData });
    return true;
  };

  return {
    user,
    teachersList,
    leaveTypesList,
    historyRecords,
    baselineCuti,
    isSyncing,
    updateConfigList,
    saveBaselineData
  };
}
