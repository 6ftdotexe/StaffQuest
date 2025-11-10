import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { load, save } from '../utils/storage';
import { addQuestCloud, isOffline } from '../api/firebase';

export default function AdminScreen(){
  const [title, setTitle] = useState('Speedy Expo Setup');
  const [xp, setXp] = useState('120');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState('Expo, FOH');
  const [stepsText, setStepsText] = useState('Turn on warmer\nStock sauces and cups\nPrep expo tools\nClean station');

  async function addQuest(){
    const data = await load();
    const id = 'q' + Date.now();
    const quest = {
      id, title, difficulty, xp: Number(xp),
      tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
      steps: stepsText.split('\n').map(s=>s.trim()).filter(Boolean)
    };
    data.quests.push(quest);
    await save(data);
    if(!isOffline()){
      try { await addQuestCloud(quest); } catch(e){}
    }
    Alert.alert('Quest added', 'Check Dashboard to view it.');
  }

  return (
    <View style={{flex:1, backgroundColor:'#0b0d10', padding:20}}>
      <Text style={{color:'#F2F2F2', fontSize:22, fontWeight:'800', marginBottom:12}}>Admin: Create Quest</Text>
      <Text style={{color:'#aab2c0'}}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:8}} />

      <Text style={{color:'#aab2c0'}}>XP</Text>
      <TextInput keyboardType="numeric" value={xp} onChangeText={setXp} style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:8}} />

      <Text style={{color:'#aab2c0'}}>Difficulty</Text>
      <TextInput value={difficulty} onChangeText={setDifficulty} style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:8}} />

      <Text style={{color:'#aab2c0'}}>Tags (comma-separated)</Text>
      <TextInput value={tags} onChangeText={setTags} style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:8}} />

      <Text style={{color:'#aab2c0'}}>Steps (one per line)</Text>
      <TextInput multiline numberOfLines={6} value={stepsText} onChangeText={setStepsText} style={{backgroundColor:'#0f131a', borderColor:'#2a3140', borderWidth:1, color:'#F2F2F2', padding:12, borderRadius:10, marginBottom:12}} />

      <TouchableOpacity onPress={addQuest} style={{backgroundColor:'#FFD447', padding:12, borderRadius:10, alignItems:'center'}}>
        <Text style={{color:'#111', fontWeight:'800'}}>Add Quest</Text>
      </TouchableOpacity>
    </View>
  );
}
