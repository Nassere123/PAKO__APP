import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { orderService } from '../../services/orderService';
import { OrderStatus } from '../../lib/api/services/orders.service';

type HomeStackParamList = {
  AgentHomeMain: undefined;
  AgentOrders: undefined;
};

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AgentHomeMain'>;

const AgentHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const orders = await orderService.getAllOrders();
      // Filtrer pour exclure :
      // - Les commandes déjà confirmées (traitées)
      // - Les commandes livrées
      // - Les commandes annulées (elles restent visibles dans PAKO CLIENT)
      const pendingOrders = orders.filter(
        (order) =>
          order.status !== OrderStatus.CONFIRMED &&
          order.status !== OrderStatus.DELIVERED &&
          order.status !== OrderStatus.CANCELLED,
      );
      setTotalCount(pendingOrders.length);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le compteur au montage avec l'indicateur de chargement
  useEffect(() => {
    fetchCount(true);
  }, [fetchCount]);

  // Recharger le compteur chaque fois que l'écran est mis au focus
  // Cela permet de synchroniser avec les changements dans AgentOrdersScreen
  // Sans afficher l'indicateur de chargement pour une meilleure UX
  useFocusEffect(
    useCallback(() => {
      fetchCount(false);
    }, [fetchCount])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../../assets/Image de livreur .png')}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
        <View style={styles.header}>
            <View>
              <Text style={styles.brand}>PAKO PRO</Text>
              <Text style={styles.subtitle}>Portail agents de gare</Text>
        </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {loading ? 'Chargement...' : `Nombre de commande : ${totalCount ?? 0}`}
              </Text>
              </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AgentOrders')}
          >
            <Text style={styles.primaryButtonText}>Mes commandes</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroImageStyle: {
    width: '120%',
    height: '120%',
    alignSelf: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: SIZES.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: SIZES.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: SIZES.font.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.md,
  },
  countText: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.md,
    paddingVertical: SIZES.spacing.lg,
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
    opacity: 0.92,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: '700',
  },
});

export default AgentHomeScreen;
