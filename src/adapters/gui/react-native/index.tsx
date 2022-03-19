import * as React from 'react';
import { Text, View } from 'react-native';
import { Application } from '../../../core/application';

export const Index = () => {
  return (
    <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <Text>Hello, world!</Text>
    </View>
  );
}