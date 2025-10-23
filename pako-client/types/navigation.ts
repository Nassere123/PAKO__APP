import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

// Types pour la navigation
export type RootStackParamList = {
  Welcome: { firstName: string; lastName: string; phone: string };
  Auth: { initialMode?: 'login' | 'register' };
  PhoneVerification: { phone: string; isRegistration: boolean; firstName?: string; lastName?: string };
  Home: undefined;
  Profile: undefined;
  PackageTracking: { packageId: string };
  History: undefined;
  MultiStepPackageRegistration: { editCart?: any };
  Evaluation: undefined;
  Payment: any; // OrderData
  Cart: undefined;
  MyPackages: undefined;
  PackageList: { category: 'received' | 'in_transit' | 'cancelled' };
  PackageRating: { packageId: string; packageData?: any };
  Notifications: undefined;
  TestOrder: undefined;
};

export type WelcomeScreenProps = StackScreenProps<RootStackParamList, 'Welcome'>;
export type AuthScreenProps = StackScreenProps<RootStackParamList, 'Auth'>;
export type PhoneVerificationScreenProps = StackScreenProps<RootStackParamList, 'PhoneVerification'>;
export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
export type ProfileScreenProps = StackScreenProps<RootStackParamList, 'Profile'>;
export type PackageTrackingScreenProps = StackScreenProps<RootStackParamList, 'PackageTracking'>;
export type HistoryScreenProps = StackScreenProps<RootStackParamList, 'History'>;
export type MultiStepPackageRegistrationScreenProps = StackScreenProps<RootStackParamList, 'MultiStepPackageRegistration'>;
export type EvaluationScreenProps = StackScreenProps<RootStackParamList, 'Evaluation'>;
export type PaymentScreenProps = StackScreenProps<RootStackParamList, 'Payment'>;
export type CartScreenProps = StackScreenProps<RootStackParamList, 'Cart'>;
export type MyPackagesScreenProps = StackScreenProps<RootStackParamList, 'MyPackages'>;
export type PackageListScreenProps = StackScreenProps<RootStackParamList, 'PackageList'>;
export type PackageRatingScreenProps = StackScreenProps<RootStackParamList, 'PackageRating'>;
export type NotificationsScreenProps = StackScreenProps<RootStackParamList, 'Notifications'>;
export type TestOrderScreenProps = StackScreenProps<RootStackParamList, 'TestOrder'>;

// Types pour les composants
export interface BaseComponentProps {
  children?: React.ReactNode;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  loading?: boolean;
  disabled?: boolean;
}

export interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export interface CardProps {
  children: React.ReactNode;
  style?: object;
}
