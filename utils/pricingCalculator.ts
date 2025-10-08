// Calculateur de prix de livraison pour PAKO
// Prix de base : 500 FCFA par kilomètre
// Supplément multi-colis : 5% du prix de base pour chaque colis supplémentaire

export interface PricingResult {
  distanceKm: number;
  basePrice: number;
  packageCount: number;
  multiPackageSurcharge: number;
  totalPrice: number;
  pricePerKm: number;
  surchargePercentage: number;
}

export class PricingCalculator {
  private static readonly PRICE_PER_KM = 500; // FCFA par kilomètre
  private static readonly MULTI_PACKAGE_SURCHARGE_PERCENT = 5; // 5% de supplément

  /**
   * Calcule le prix de livraison basé sur la distance et le nombre de colis
   * @param distanceKm Distance en kilomètres
   * @param packageCount Nombre de colis à livrer
   * @returns Détail du calcul de prix
   */
  static calculateDeliveryPrice(distanceKm: number, packageCount: number): PricingResult {
    // Prix de base basé sur la distance
    const basePrice = Math.round(distanceKm * this.PRICE_PER_KM);
    
    // Calcul du supplément pour plusieurs colis
    // Si 1 colis : pas de supplément
    // Si 2+ colis : 5% de supplément par colis supplémentaire
    const additionalPackages = Math.max(0, packageCount - 1);
    const surchargePercentage = additionalPackages * this.MULTI_PACKAGE_SURCHARGE_PERCENT;
    const multiPackageSurcharge = Math.round((basePrice * surchargePercentage) / 100);
    
    // Prix total
    const totalPrice = basePrice + multiPackageSurcharge;

    return {
      distanceKm: Math.round(distanceKm * 100) / 100, // Arrondir à 2 décimales
      basePrice,
      packageCount,
      multiPackageSurcharge,
      totalPrice,
      pricePerKm: this.PRICE_PER_KM,
      surchargePercentage
    };
  }

  /**
   * Formate le prix en FCFA pour l'affichage
   * @param price Prix en FCFA
   * @returns Prix formaté avec séparateurs de milliers
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }

  /**
   * Calcule le prix par colis pour un envoi multi-colis
   * @param totalPrice Prix total de la livraison
   * @param packageCount Nombre de colis
   * @returns Prix par colis
   */
  static calculatePricePerPackage(totalPrice: number, packageCount: number): number {
    return Math.round(totalPrice / packageCount);
  }

  /**
   * Génère un résumé textuel du calcul de prix
   * @param pricing Résultat du calcul de prix
   * @returns Résumé formaté
   */
  static generatePricingSummary(pricing: PricingResult): string {
    if (pricing.packageCount === 1) {
      return `${pricing.distanceKm} km × ${pricing.pricePerKm} FCFA = ${this.formatPrice(pricing.totalPrice)}`;
    } else {
      return `${pricing.distanceKm} km × ${pricing.pricePerKm} FCFA = ${this.formatPrice(pricing.basePrice)} + ${pricing.surchargePercentage}% (${pricing.packageCount} colis) = ${this.formatPrice(pricing.totalPrice)}`;
    }
  }
}
