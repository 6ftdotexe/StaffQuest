import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { load, save } from '../utils/storage';

export default function QuestDetailScreen({ user, questId, onBack }){
  const [q, setQ] = React.useState(null);
  const [checks, setChecks] = React.useState([]);

  React.useEffect(()=>{
    (async ()=>{
      const data = await load();
      const quest = data.quests.find(x=>x.id===questId) || data.quests[0];
      setQ(quest);
      setChecks(quest.steps.map(()=>false));
    })();
  }, [questId]);

  if(!q) return <View style={{flex:1, backgroundColor:'#0b0d10'}} />;

  const allDone = checks.every(Boolean);
  const toggle = (i) => setChecks(prev => prev.map((v, idx)=> idx===i ? !v : v));

  const complete = async () => {
    const data = await load();
    const me = data.users.find(u=>u.id===user.id);
    me.xp = (me.xp||0) + (q.xp||0);
    await save(data);
    onBack();
  };

  return (
    <ScrollView style={{flex:1, backgroundColor:'#0b0d10', padding:20}}>
      <TouchableOpacity onPress={onBack}><Text style={{color:'#aab2c0'}}>&larr; Back</Text></TouchableOpacity>
      <Text style={{color:'#F2F2F2', fontSize:24, fontWeight:'800', marginTop:8}}>{q.title}</Text>
      <Text style={{color:'#aab2c0', marginBottom:12}}>{q.difficulty} • {q.xp} XP</Text>

      {q.steps.map((s, i)=>(
        <TouchableOpacity key={i} onPress={()=>toggle(i)} style={{flexDirection:'row', alignItems:'center', gap:10, paddingVertical:8}}>
          <View style={{width:22, height:22, borderRadius:6, borderWidth:1, borderColor:'#2a3140', backgroundColor: checks[i] ? '#FFD447' : '#0f131a'}} />
          <Text style={{color:'#F2F2F2'}}>{s}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity disabled={!allDone} onPress={complete} style={{opacity: allDone?1:0.6, backgroundColor:'#FFD447', padding:12, borderRadius:10, alignItems:'center', marginTop:12}}>
        <Text style={{color:'#111', fontWeight:'800'}}>Complete Quest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
