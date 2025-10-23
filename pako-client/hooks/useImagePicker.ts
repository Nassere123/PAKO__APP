import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface UseImagePickerReturn {
  selectedImage: string | null;
  pickImage: () => void;
  clearImage: () => void;
  isPicking: boolean;
}

export const useImagePicker = (): UseImagePickerReturn => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = async () => {
    try {
      setIsPicking(true);
      
      // Demander les permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'L\'accès à la galerie photo est nécessaire pour ajouter une photo de profil.');
        setIsPicking(false);
        return;
      }

      // Lancer le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      setIsPicking(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          Alert.alert('Succès', 'Photo de profil mise à jour avec succès !');
        }
      } else {
        console.log('L\'utilisateur a annulé la sélection d\'image');
      }
    } catch (error) {
      setIsPicking(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
      console.error('Erreur ImagePicker:', error);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    pickImage,
    clearImage,
    isPicking,
  };
};
