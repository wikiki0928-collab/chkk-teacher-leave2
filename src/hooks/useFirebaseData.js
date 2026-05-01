import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from '../lib/firebase';
import { rawTeachers, rawLeaveTypes } from '../constants/data';

export function useFirebaseData(showToast) {
  const [user, setUser] = useState(null);
  const [teachersList, setTeachersList] = useState(rawTeachers);
  const [leaveTypesList, setLeaveTypesList] = useState(rawLeaveTypes);
  const [archivedTeachers, setArchivedTeachers] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);
  const [baselineCuti, setBaselineCuti] = useState({});
  const [isSyncing, setIsSyncing] = useState(true);

  // Cache: year string -> records array
  const yearCacheRef = useRef(new Map());
  // Real-time listener for the current subscribed year
  const currentYearUnsubRef = useRef(null);
  const currentListenedYearRef = useRef(null);
  // Refs to avoid stale closures
  const userRef = useRef(null);
  const availableYearsRef = useRef([new Date().getFullYear().toString()]);
  const teachersListRef = useRef(rawTeachers);
  const archivedTeachersRef = useRef([]);

  // Keep refs in sync with state
  useEffect(() => { availableYearsRef.current = availableYears; }, [availableYears]);
  useEffect(() => { teachersListRef.current = teachersList; }, [teachersList]);
  useEffect(() => { archivedTeachersRef.current = archivedTeachers; }, [archivedTeachers]);

  // ─── Auth ──────────────────────────────────────────────────────────────────
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
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      userRef.current = u;
    });
    return () => unsubAuth();
  }, []);

  // ─── Rebuild historyRecords from all cached years ──────────────────────────
  const rebuildHistoryRecords = useCallback(() => {
    const allRecords = [];
    yearCacheRef.current.forEach(records => allRecords.push(...records));
    const sorted = allRecords.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setHistoryRecords(sorted);
  }, []);

  // ─── Subscribe to a year with real-time listener ───────────────────────────
  const subscribeToYear = useCallback((year, currentUser) => {
    if (!currentUser) return;
    // Already listening to this year
    if (currentListenedYearRef.current === year && currentYearUnsubRef.current) return;

    // Unsubscribe from previous listener
    if (currentYearUnsubRef.current) {
      currentYearUnsubRef.current();
      currentYearUnsubRef.current = null;
    }

    currentListenedYearRef.current = year;
    const histRef = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const q = query(
      histRef,
      where('startDate', '>=', `${year}-01-01`),
      where('startDate', '<=', `${year}-12-31`)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      yearCacheRef.current.set(year, docs);
      rebuildHistoryRecords();
    });

    currentYearUnsubRef.current = unsub;
  }, [rebuildHistoryRecords]);

  // ─── One-time load for past years (cached) ────────────────────────────────
  const loadYearData = useCallback(async (year) => {
    if (yearCacheRef.current.has(year)) return yearCacheRef.current.get(year);
    const currentUser = userRef.current;
    if (!currentUser) return [];

    const histRef = collection(db, 'artifacts', appId, 'public', 'data', 'leave_history');
    const q = query(
      histRef,
      where('startDate', '>=', `${year}-01-01`),
      where('startDate', '<=', `${year}-12-31`)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    yearCacheRef.current.set(year, docs);
    rebuildHistoryRecords();
    return docs;
  }, [rebuildHistoryRecords]);

  // ─── Invalidate year cache (call after add/edit/delete on a past year) ─────
  const invalidateCacheForYear = useCallback((year) => {
    if (year === currentListenedYearRef.current) return; // real-time handles this
    yearCacheRef.current.delete(year);
  }, []);

  // ─── Update year_index in Firestore ───────────────────────────────────────
  const updateYearIndex = useCallback(async (year) => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    const currentYears = availableYearsRef.current;
    if (currentYears.includes(year)) return;
    const newYears = [...new Set([...currentYears, year])].sort();
    const yearIndexRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'year_index');
    await setDoc(yearIndexRef, { years: newYears });
  }, []);

  // ─── Main Firestore listeners (config docs) ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);
    const currentYear = new Date().getFullYear().toString();

    const teachersRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'teachers_list');
    const unsubTeachers = onSnapshot(teachersRef, (snap) => {
      if (snap.exists()) setTeachersList(snap.data().list || []);
      else setDoc(snap.ref, { list: rawTeachers });
      setIsSyncing(false);
    });

    const archivedRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'archived_teachers');
    const unsubArchived = onSnapshot(archivedRef, (snap) => {
      if (snap.exists()) setArchivedTeachers(snap.data().list || []);
      else setDoc(snap.ref, { list: [] });
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

    const yearIndexRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'year_index');
    const unsubYearIndex = onSnapshot(yearIndexRef, (snap) => {
      if (snap.exists()) {
        const years = snap.data().years || [currentYear];
        const merged = [...new Set([...years, currentYear])].sort().reverse();
        setAvailableYears(merged);
      } else {
        setDoc(snap.ref, { years: [currentYear] });
        setAvailableYears([currentYear]);
      }
    });

    // Subscribe real-time to current calendar year
    subscribeToYear(currentYear, user);

    return () => {
      unsubTeachers();
      unsubArchived();
      unsubLeaves();
      unsubBaseline();
      unsubYearIndex();
      if (currentYearUnsubRef.current) {
        currentYearUnsubRef.current();
        currentYearUnsubRef.current = null;
      }
    };
  }, [user, subscribeToYear]);

  // ─── Config helpers ────────────────────────────────────────────────────────
  const updateConfigList = (col, newList) => {
    if (!user) { showToast("❌ 请先连接云端！"); return; }
    setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', col), { list: newList });
  };

  const saveBaselineData = async (newData) => {
    if (!user) return false;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'baseline_cuti'), { data: newData });
    return true;
  };

  // ─── Teacher archive / restore ────────────────────────────────────────────
  const archiveTeacher = async (name) => {
    if (!user) { showToast("❌ 请先连接云端！"); return false; }
    const newActiveList = teachersListRef.current.filter(t => t !== name);
    const newArchivedList = [...archivedTeachersRef.current, name];
    await Promise.all([
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'teachers_list'), { list: newActiveList }),
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'archived_teachers'), { list: newArchivedList }),
    ]);
    return true;
  };

  const restoreTeacher = async (name) => {
    if (!user) { showToast("❌ 请先连接云端！"); return false; }
    const newArchivedList = archivedTeachersRef.current.filter(t => t !== name);
    const newActiveList = [...teachersListRef.current, name];
    await Promise.all([
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'teachers_list'), { list: newActiveList }),
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'archived_teachers'), { list: newArchivedList }),
    ]);
    return true;
  };

  return {
    user,
    teachersList,
    leaveTypesList,
    archivedTeachers,
    historyRecords,
    availableYears,
    baselineCuti,
    isSyncing,
    updateConfigList,
    saveBaselineData,
    archiveTeacher,
    restoreTeacher,
    loadYearData,
    subscribeToYear,
    updateYearIndex,
    invalidateCacheForYear,
  };
}
