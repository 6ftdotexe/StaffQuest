import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { initFirebase, firebaseGoogleLogin, ensureUser, isOffline } from '../api/firebase';
import { load, save } from '../utils/storage';

initFirebase();

export default function LoginScreen({ onLogin }){
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState(null);

  async function manualLogin(){
    const data = await load();
    const id = 'u' + Date.now();
    const user = { id, name: name || 'New User', role, xp: 0 };
    data.users.push(user);
    await save(data);
    if(!isOffline()){
      try { await ensureUser(id, { name:user.name, role:user.role, xp:user.xp }); } catch(e){}
    }
    onLogin(user);
  }

  async function googleLogin(){
    try{
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      const response = await AuthSession.startAsync({
        authUrl:
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=id_token&scope=openid%20email%20profile`
      });

      if(response.type === 'success'){
        const idToken = response.params.id_token;
        const fbUser = await firebaseGoogleLogin(idToken);
        const user = {
          id: fbUser?.uid || ('u' + Date.now()),
          name: fbUser?.displayName || 'Google User',
          role: 'employee',
          xp: 0
        };

        const data = await load();
        if(!data.users.find(u=>u.id===user.id)){
          data.users.push(user);
          await save(data);
        }
        if(!isOffline()){
          try { await ensureUser(user.id, { name:user.name, role:user.role, xp:user.xp }); } catch(e){}
        }
        onLogin(user);
      }
    }catch(e){
      setError('Google sign-in failed (demo config). Manual login still works.');
    }
  }

  return (
    <View style={{flex:1, backgroundColor:'#0b0d10', padding:20, justifyContent:'center'}}>
      <View style={{alignItems:'center', marginBottom:24}}>
        <Text style={{color:'#FFD447', fontSize:32, fontWeight:'800'}}>StaffQuest</Text>
        <Text style={{color:'#aab2c0'}}>Sign in to continue</Text>
      </View>

      <Text style={{color:'#aab2c0', marginBottom:6}}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#7a8599"
        style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:10}}
      />

      <Text style={{color:'#aab2c0', marginBottom:6}}>Role</Text>
      <View style={{flexDirection:'row', gap:10, marginBottom:12}}>
        {['employee','manager'].map(r => (
          <TouchableOpacity key={r} onPress={()=>setRole(r)} style={{flex:1, backgroundColor: role===r ? '#FFD447' : '#1a2130', padding:10, borderRadius:10, alignItems:'center'}}>
            <Text style={{color: role===r ? '#111':'#F2F2F2', fontWeight:'700'}}>{r.charAt(0).toUpperCase()+r.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={manualLogin} style={{backgroundColor:'#FFD447', padding:12, borderRadius:10, alignItems:'center', marginBottom:10}}>
        <Text style={{color:'#111', fontWeight:'800'}}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={googleLogin} style={{backgroundColor:'#141820', padding:12, borderRadius:10, alignItems:'center', borderWidth:1, borderColor:'#202636'}}>
        <Text style={{color:'#F2F2F2', fontWeight:'700'}}>Sign in with Google</Text>
      </TouchableOpacity>

      {error ? <Text style={{color:'#ff7a7a', marginTop:10}}>{error}</Text> : null}
    </View>
  );
}
