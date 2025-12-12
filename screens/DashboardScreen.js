import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { load, levelFromXp } from '../utils/storage';
import QuestCard from '../components/QuestCard';

export default function DashboardScreen({ user, onOpenQuest, onNav }){
  const [state, setState] = React.useState({ me:user, data:null });

  React.useEffect(()=>{
    (async ()=>{
      const data = await load();
      const me = data.users.find(u => u.id === user.id) || user;
      setState({ me, data });
    })();
  }, [user]);

  const stats = useMemo(()=>{
    if(!state.data) return { quests:0, users:0, level:1, pct:0, xp:0 };
    const l = levelFromXp(state.me.xp || 0);
    return { quests: state.data.quests.length, users: state.data.users.length, level:l.level, pct:l.pct, xp: state.me.xp || 0 };
  }, [state]);

  if(!state.data) return <View style={{flex:1, backgroundColor:'#0b0d10'}} />;

  return (
    <ScrollView style={{flex:1, backgroundColor:'#0b0d10', padding:20}}>
      <View style={{backgroundColor:'#141820', borderWidth:1, borderColor:'#202636', borderRadius:16, padding:16, marginBottom:12}}>
        <Text style={{color:'#F2F2F2', fontSize:20, fontWeight:'800'}}>Welcome, {state.me.name}</Text>
        <Text style={{color:'#aab2c0', marginBottom:8}}>Complete quests to earn XP and level up.</Text>
        <View style={{flexDirection:'row', gap:8, flexWrap:'wrap'}}>
          <Text style={{color:'#aab2c0'}}>Level {stats.level}</Text>
          <Text style={{color:'#aab2c0'}}>•</Text>
          <Text style={{color:'#aab2c0'}}>{stats.xp} XP</Text>
          <Text style={{color:'#aab2c0'}}>•</Text>
          <Text style={{color:'#aab2c0'}}>{stats.users} teammates</Text>
          <Text style={{color:'#aab2c0'}}>•</Text>
          <Text style={{color:'#aab2c0'}}>{stats.quests} quests</Text>
        </View>
      </View>

      {state.data.quests.map(q => (
        <QuestCard key={q.id} q={q} onOpen={onOpenQuest} />
      ))}

      <View style={{height:20}} />

      <View style={{flexDirection:'row', gap:10}}>
        <TouchableOpacity onPress={()=>onNav('leaderboard')} style={{flex:1, backgroundColor:'#141820', borderColor:'#202636', borderWidth:1, borderRadius:10, padding:12, alignItems:'center'}}>
          <Text style={{color:'#F2F2F2'}}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>onNav('admin')} style={{flex:1, backgroundColor:'#FFD447', borderRadius:10, padding:12, alignItems:'center'}}>
          <Text style={{color:'#111', fontWeight:'800'}}>Admin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
