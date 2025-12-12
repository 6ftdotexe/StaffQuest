import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import QuestDetailScreen from './screens/QuestDetailScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminScreen from './screens/AdminScreen';

export default function App(){
  const [screen, setScreen] = React.useState('login');
  const [user, setUser] = React.useState(null);
  const [questId, setQuestId] = React.useState(null);

  function onLogin(u){ setUser(u); setScreen('dashboard'); }
  function openQuest(id){ setQuestId(id); setScreen('quest'); }

  return (
    <View style={{flex:1, backgroundColor:'#0b0d10'}}>
      <StatusBar style="light" />
      {(!user || screen==='login') && <LoginScreen onLogin={onLogin} />}
      {(user && screen==='dashboard') && <DashboardScreen user={user} onOpenQuest={openQuest} onNav={setScreen} />}
      {(user && screen==='quest') && <QuestDetailScreen user={user} questId={questId} onBack={()=>setScreen('dashboard')} />}
      {(user && screen==='leaderboard') && <LeaderboardScreen />}
      {(user && screen==='admin') && <AdminScreen />}

      {user && (
        <View style={{position:'absolute', top:40, left:20, right:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <Text style={{color:'#FFD447', fontWeight:'800'}}>StaffQuest</Text>
          <View style={{flexDirection:'row', gap:12}}>
            <TouchableOpacity onPress={()=>setScreen('dashboard')}><Text style={{color:'#F2F2F2'}}>Dashboard</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setScreen('leaderboard')}><Text style={{color:'#F2F2F2'}}>Leaderboard</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setScreen('admin')}><Text style={{color:'#F2F2F2'}}>Admin</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
