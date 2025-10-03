import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { AnimatedModal } from '../components';

type PackageRatingScreenProps = StackScreenProps<RootStackParamList, 'PackageRating'>;


const PackageRatingScreen: React.FC<PackageRatingScreenProps> = ({ navigation, route }) => {
  const { packageId, packageData } = route.params as { 
    packageId: string; 
    packageData: any 
  };

  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOverallRating = (rating: number) => {
    setOverallRating(rating);
  };


  const renderStars = (rating: number, onPress: (rating: number) => void) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress(i)}
          style={styles.starButton}
        >
          <Text style={[styles.star, { fontSize: 32 }]}>
            {i <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleSubmitRating = () => {
    if (overallRating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note globale au service');
      return;
    }
    
    // Sauvegarder l'évaluation
    console.log('Évaluation sauvegardée:', {
      packageId,
      overallRating,
      comment
    });
    
    // Afficher la modal de succès
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Très décevant';
      case 2: return 'Décevant';
      case 3: return 'Correct';
      case 4: return 'Bien';
      case 5: return 'Excellent';
      default: return 'Donnez votre avis';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Évaluer la livraison</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations du colis */}
        <View style={styles.packageInfo}>
          <Text style={styles.packageTitle}>📦 Colis {packageId}</Text>
          <Text style={styles.packageDescription}>{packageData?.description || 'Description du colis'}</Text>
          <Text style={styles.packageDate}>Livré le {packageData?.date || 'Date de livraison'}</Text>
        </View>

        {/* Évaluation globale */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Note globale du service</Text>
          <Text style={styles.sectionSubtitle}>Comment évaluez-vous votre expérience ?</Text>
          
          {renderStars(overallRating, handleOverallRating)}
          
          <Text style={styles.ratingText}>{getRatingText(overallRating)}</Text>
        </View>

        {/* Commentaire */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
          <Text style={styles.sectionSubtitle}>Partagez votre expérience avec nous</Text>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Décrivez votre expérience de livraison..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity 
          style={[styles.submitButton, overallRating === 0 && styles.submitButtonDisabled]} 
          onPress={handleSubmitRating}
          disabled={overallRating === 0}
        >
          <Text style={styles.submitButtonText}>
            {overallRating === 0 ? 'Donnez une note pour continuer' : 'Soumettre l\'évaluation'}
          </Text>
        </TouchableOpacity>

        {/* Informations supplémentaires */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Pourquoi évaluer ?</Text>
          <Text style={styles.infoText}>
            Votre évaluation nous aide à améliorer la qualité de notre service de livraison. 
            Vos commentaires sont précieux pour nous et nos livreurs.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de succès animée */}
      <AnimatedModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Évaluation soumise"
        message={`Merci pour votre évaluation !\n\nNote globale: ${overallRating}/5 ⭐\n\nVotre avis nous aide à améliorer notre service.`}
        buttonText="Parfait !"
        showCloseButton={false}
      />
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
  backButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  packageInfo: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  packageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  commentSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default PackageRatingScreen;

