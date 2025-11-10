import React from 'react';
import { View, Text } from 'react-native';
import { load } from '../utils/storage';

export default function LeaderboardScreen(){
  const [users, setUsers] = React.useState([]);
  React.useEffect(()=>{
    (async ()=>{
      const data = await load();
      const sorted = [...data.users].sort((a,b)=> (b.xp||0)-(a.xp||0));
      setUsers(sorted);
    })();
  }, []);

  return (
    <View style={{flex:1, backgroundColor:'#0b0d10', padding:20}}>
      <Text style={{color:'#F2F2F2', fontSize:22, fontWeight:'800', marginBottom:12}}>Leaderboard</Text>
      {users.map(u => (
        <View key={u.id} style={{flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderTopWidth:1, borderTopColor:'#202636'}}>
          <Text style={{color:'#F2F2F2'}}>{u.name}</Text>
          <Text style={{color:'#aab2c0'}}>{u.role}</Text>
          <Text style={{color:'#FFD447', fontWeight:'800'}}>{u.xp} XP</Text>
        </View>
      ))}
    </View>
  );
}
