import React from 'react';
import { Text, TextProps } from 'react-native';

export function CustomText(props: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'CarmenSans' }, props.style]} />;
} 