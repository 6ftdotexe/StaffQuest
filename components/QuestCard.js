import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function QuestCard({ q, onOpen }){
  return (
    <View style={{backgroundColor:'#141820', borderWidth:1, borderColor:'#202636', borderRadius:16, padding:16, marginBottom:12}}>
      <Text style={{color:'#F2F2F2', fontSize:18, fontWeight:'700'}}>{q.title}</Text>
      <Text style={{color:'#aab2c0', marginBottom:8}}>{q.difficulty} • {q.xp} XP</Text>

      <View style={{flexDirection:'row', flexWrap:'wrap', marginBottom:8}}>
        {(q.tags||[]).map(t => (
          <Text key={t} style={{color:'#cfe0ff', backgroundColor:'#1e2633', paddingHorizontal:8, paddingVertical:4, borderRadius:999, marginRight:6, marginBottom:6}}>
            {t}
          </Text>
        ))}
      </View>

      <TouchableOpacity onPress={()=>onOpen(q.id)} style={{backgroundColor:'#FFD447', paddingVertical:10, borderRadius:10, alignItems:'center'}}>
        <Text style={{color:'#111', fontWeight:'700'}}>Open</Text>
      </TouchableOpacity>
    </View>
  );
}
