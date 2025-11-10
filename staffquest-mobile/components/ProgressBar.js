import React from 'react';
import { View } from 'react-native';

export default function ProgressBar({pct=0}){
  return (
    <View style={{height:10, backgroundColor:'#0f131a', borderRadius:999, overflow:'hidden', borderWidth:1, borderColor:'#2a3140'}}>
      <View style={{height:'100%', width:`${pct}%`, backgroundColor:'#FFD447'}} />
    </View>
  );
}
