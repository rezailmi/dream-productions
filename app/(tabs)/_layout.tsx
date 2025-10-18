import React from 'react';
import { NativeTabs, Label, Icon } from 'expo-router/unstable-native-tabs';
import Colors from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={Colors.primary}
      inactiveTintColor={Colors.inactive}
    >
      <NativeTabs.Trigger name="index">
        <Icon ios={{ sfSymbol: 'house.fill' }} />
        <Label>Dreams</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon ios={{ sfSymbol: 'person.crop.circle' }} />
        <Label>Me</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

