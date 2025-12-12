import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let app, auth, db;
let offline = false;

export function initFirebase(){
  try{
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }catch(e){
    offline = true;
  }
}
export function isOffline(){ return offline || !db; }

export async function ensureUser(uid, profile){
  if(isOffline()) return;
  await setDoc(doc(db,'users',uid), profile, { merge:true });
}

export async function fetchQuests(){
  if(isOffline()) return null;
  const snap = await getDocs(collection(db,'quests'));
  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}

export async function addQuestCloud(quest){
  if(isOffline()) return null;
  const ref = await addDoc(collection(db,'quests'), quest);
  return ref.id;
}

export async function firebaseGoogleLogin(idToken){
  if(isOffline()) return null;
  const credential = GoogleAuthProvider.credential(idToken);
  const res = await signInWithCredential(auth, credential);
  return res.user;
}
