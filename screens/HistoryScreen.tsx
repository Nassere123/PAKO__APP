import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import { COLORS } from '../constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HistoryScreenProps = StackScreenProps<RootStackParamList, 'History'>;

interface HistoryItem {
  id: string;
  packageId: string;
  date: string;
  status: 'delivered' | 'in_transit' | 'pending';
  destination: string;
  description: string;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      packageId: '#PAKO-2024-001',
      date: '15 Jan 2024',
      status: 'delivered',
      destination: 'Gare du Nord',
      description: 'Colis livré avec succès',
    },
    {
      id: '2',
      packageId: '#PAKO-2024-002',
      date: '12 Jan 2024',
      status: 'delivered',
      destination: 'Gare de Lyon',
      description: 'Colis récupéré par le destinataire',
    },
    {
      id: '3',
      packageId: '#PAKO-2024-003',
      date: '10 Jan 2024',
      status: 'delivered',
      destination: 'Gare Montparnasse',
      description: 'Livraison effectuée',
    },
    {
      id: '4',
      packageId: '#PAKO-2024-004',
      date: '8 Jan 2024',
      status: 'delivered',
      destination: 'Gare Saint-Lazare',
      description: 'Colis déposé à la gare',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return COLORS.primary;
      case 'in_transit':
        return '#FFD700';
      case 'pending':
        return '#FF6B35';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'in_transit':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.packageId}>{item.packageId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.destination}>📍 {item.destination}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image 
            source={require('../assets/8bedea66-f318-404b-8ffd-73beacaa06c5.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>PAKO Client</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Historique des colis</Text>
        
        <FlatList
          data={historyItems}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  logoImage: {
    width: 80,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  destination: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default HistoryScreen;
