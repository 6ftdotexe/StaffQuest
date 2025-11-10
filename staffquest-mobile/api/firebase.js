import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let app = null, auth = null, db = null;
let offline = false;

export function initFirebase(){
  try{
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // If using demo placeholders, Firestore calls will likely fail;
    // we detect and fall back to offline mode gracefully.
  }catch(e){
    offline = true;
  }
}

export function isOffline(){ return offline; }

export async function ensureUser(uid, profile){
  if(offline || !db) return; // skip cloud
  const ref = doc(db, 'users', uid);
  await setDoc(ref, profile, { merge: true });
}

export async function fetchQuests(){
  if(offline || !db) return null;
  const snap = await getDocs(collection(db, 'quests'));
  return snap.docs.map(d=>({ id: d.id, ...d.data() }));
}

export async function addQuestCloud(quest){
  if(offline || !db) return null;
  const ref = await addDoc(collection(db, 'quests'), quest);
  return ref.id;
}

// Google sign-in using ID token from expo-auth-session
export async function firebaseGoogleLogin(idToken){
  if(offline || !auth) return null;
  const credential = GoogleAuthProvider.credential(idToken);
  const res = await signInWithCredential(auth, credential);
  return res.user;
}
