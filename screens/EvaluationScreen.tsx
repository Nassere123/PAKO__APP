import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type EvaluationScreenProps = StackScreenProps<RootStackParamList, 'Evaluation'>;

const EvaluationScreen: React.FC<EvaluationScreenProps> = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }

    setLoading(true);
    
    // Simulation d'envoi d'évaluation
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Merci !',
        'Votre évaluation a été enregistrée avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const renderStar = (index: number) => {
    const isActive = index <= rating;
    return (
      <TouchableOpacity
        key={index}
        style={styles.starContainer}
        onPress={() => handleRatingPress(index)}
      >
        <Text style={[styles.star, isActive && styles.activeStar]}>
          ⭐
        </Text>
      </TouchableOpacity>
    );
  };

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

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Évaluer la livraison</Text>
        
        <View style={styles.packageInfo}>
          <Text style={styles.packageId}>#PAKO-2024-001</Text>
          <Text style={styles.packageDetails}>Gare du Nord → Abidjan</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Comment évaluez-vous ce service ?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(renderStar)}
          </View>
          
          <Text style={styles.ratingText}>
            {rating === 0 && 'Donnez une note'}
            {rating === 1 && 'Très insatisfait'}
            {rating === 2 && 'Insatisfait'}
            {rating === 3 && 'Neutre'}
            {rating === 4 && 'Satisfait'}
            {rating === 5 && 'Très satisfait'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Commentaire (optionnel)</Text>
          
          <TextInput
            style={[styles.commentInput, styles.textArea]}
            placeholder="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Envoi...' : 'Envoyer l\'évaluation'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: '#2C3E50',
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
  packageInfo: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  packageId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  packageDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starContainer: {
    marginHorizontal: 8,
  },
  star: {
    fontSize: 40,
    opacity: 0.3,
  },
  activeStar: {
    opacity: 1,
  },
  ratingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  commentSection: {
    marginBottom: 30,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EvaluationScreen;
