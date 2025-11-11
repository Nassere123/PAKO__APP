import { API_CONFIG } from '../constants/api';

export interface OrderPackageData {
  packageCode: string;
}

export interface OrderData {
  customerId: string;
  destinationStation: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  pickupAddress: string;
  stationLatitude?: number;
  stationLongitude?: number;
  distanceKm?: number;
  receiverPhone: string;
  senderPhone: string;
  deliveryType: 'standard' | 'express';
  paymentMethod: 'cash' | 'wave' | 'orange';
  packages: OrderPackageData[];
  totalPrice?: number;
}

export class OrderService {
  static async startOrderProcess(customerId: string, customerName?: string): Promise<any> {
    try {
      console.log('=== DEBUG OrderService.startOrderProcess ===');
      console.log('Démarrage du processus de commande pour:', customerId);

      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/start-order-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          customerName: customerName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', response.status, errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Processus de commande démarré:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors du démarrage du processus:', error);
      throw error;
    }
  }

  static async createOrder(orderData: OrderData, customerId: string): Promise<any> {
    try {
      console.log('=== DEBUG OrderService.createOrder ===');
      console.log('Données à envoyer:', JSON.stringify(orderData, null, 2));
      console.log('Customer ID (local):', customerId);
      console.log('Type d\'ID:', typeof customerId);
      console.log('URL de l\'API:', `${API_CONFIG.BASE_URL}/orders`);
      console.log('BASE_URL:', API_CONFIG.BASE_URL);

      // Si l'ID est numérique, récupérer l'utilisateur existant par téléphone
      let backendCustomerId = customerId;
      if (typeof customerId === 'string' && /^\d+$/.test(customerId)) {
        console.log('🔄 ID numérique détecté, recherche de l\'utilisateur existant...');
        
        // Chercher l'utilisateur existant par téléphone
        const searchResponse = await fetch(`${API_CONFIG.BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (searchResponse.ok) {
          const users = await searchResponse.json();
          console.log('📋 Utilisateurs trouvés:', users.length);
          console.log('🔍 Recherche avec le téléphone:', orderData.senderPhone);
          
          // Chercher l'utilisateur avec le numéro de téléphone de l'expéditeur
          const existingUser = users.find((user: any) => user.phone === orderData.senderPhone);
          
          if (existingUser) {
            backendCustomerId = existingUser.id;
            console.log('✅ Utilisateur existant trouvé avec l\'ID:', backendCustomerId);
            console.log('👤 Nom:', existingUser.firstName, existingUser.lastName);
            console.log('📞 Téléphone:', existingUser.phone);
          } else {
            console.log('⚠️ Utilisateur non trouvé, utilisation de l\'ID local');
            console.log('📋 Téléphones disponibles:', users.map((u: any) => u.phone));
          }
        } else {
          console.log('⚠️ Impossible de rechercher l\'utilisateur, utilisation de l\'ID local');
        }
      }

      // Structure simplifiée pour correspondre au backend
      const createOrderRequest = {
        customerId: backendCustomerId,
        destinationStation: orderData.destinationStation,
        deliveryAddress: orderData.deliveryAddress,
        deliveryLatitude: orderData.deliveryLatitude,
        deliveryLongitude: orderData.deliveryLongitude,
        pickupAddress: orderData.pickupAddress,
        stationLatitude: orderData.stationLatitude,
        stationLongitude: orderData.stationLongitude,
        distanceKm: orderData.distanceKm,
        receiverPhone: orderData.receiverPhone,
        senderPhone: orderData.senderPhone,
        deliveryType: orderData.deliveryType,
        paymentMethod: orderData.paymentMethod,
        packages: orderData.packages.map(pkg => ({
          packageCode: pkg.packageCode,
        })),
        totalPrice: orderData.totalPrice,
      };

      console.log('Requête formatée:', createOrderRequest);
      console.log('🆔 ID utilisateur final utilisé:', backendCustomerId);

      console.log('📡 Envoi de la requête au backend...');
      console.log('🔗 URL:', `${API_CONFIG.BASE_URL}/orders`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createOrderRequest),
      });

      console.log(`📡 Statut de la réponse: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur de réponse:', response.status, errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Commande créée avec succès:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ ERREUR COMPLÈTE OrderService.createOrder:');
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Response:', error.response?.data);
      console.error('URL:', error.config?.url);
      console.error('BaseURL:', error.config?.baseURL);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      throw error;
    }
  }

  static async getOrdersByCustomer(customerId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/customer/${customerId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }
}