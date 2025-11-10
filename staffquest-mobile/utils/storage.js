// AsyncStorage wrapper + seed data
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'staffquest.v1';

const seed = {
  users: [
    { id:'u1', name:'Lance', role:'manager', xp: 3200 },
    { id:'u2', name:'Ava', role:'employee', xp: 1100 },
    { id:'u3', name:'Noah', role:'employee', xp: 1800 }
  ],
  quests: [
    { id:'q1', title:'Order Accuracy Mission', difficulty:'Easy', xp:100, tags:['FOH','Accuracy'], steps:[
      'Greet the guest within 5 seconds',
      'Repeat the order to confirm',
      'Verify modifiers and allergies',
      'Read back total and thank the guest'
    ]},
    { id:'q2', title:'Clean-Up Speed Run', difficulty:'Medium', xp:150, tags:['BOH','Sanitation'], steps:[
      'Clear and sanitize a 4-top table',
      'Refresh condiments and silverware',
      'Sweep the section floor',
      'Log completion in checklist'
    ]},
    { id:'q3', title:'Customer Recovery Scenario', difficulty:'Hard', xp:300, tags:['FOH','Service'], steps:[
      'Listen to the complaint without interruption',
      'Apologize and restate the issue',
      'Offer an appropriate solution',
      'Check back and thank them for the feedback'
    ]}
  ]
};

export async function load(){
  let data = await AsyncStorage.getItem(KEY);
  if(!data){
    await AsyncStorage.setItem(KEY, JSON.stringify(seed));
    data = JSON.stringify(seed);
  }
  return JSON.parse(data);
}

export async function save(data){
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function levelFromXp(xp){
  const level = Math.floor(Math.sqrt(xp/100)) + 1;
  const cur = xp - Math.pow(level-1,2)*100;
  const next = Math.pow(level,2)*100 - Math.pow(level-1,2)*100;
  return { level, cur, next, pct: Math.min(100, Math.round((cur/next)*100)) };
}
