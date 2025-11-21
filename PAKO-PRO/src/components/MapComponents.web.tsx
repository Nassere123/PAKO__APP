import { View, Text } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Composants de fallback pour le web
export const MapView = ({ children, style, ...props }: any) => (
  <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#666' }}>Carte non disponible sur le web</Text>
    {children}
  </View>
);

export const Marker = ({ children, ...props }: any) => <View>{children}</View>;

export const UrlTile = () => null;

