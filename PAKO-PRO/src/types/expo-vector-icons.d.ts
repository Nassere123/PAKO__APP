declare module '@expo/vector-icons' {
  import * as React from 'react';
  import { TextStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    [key: string]: unknown;
  }

  export class MaterialCommunityIcons extends React.Component<IconProps> {}
  export class Ionicons extends React.Component<IconProps> {}
}

