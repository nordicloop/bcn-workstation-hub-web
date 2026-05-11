import type { Property } from "@bcn/core";

export interface PriceEstimate {
  pricePerNight: number;
  currency: string;
  confidence: 'high' | 'medium' | 'low';
  method: string;
}

export function estimatePriceFromProperty(property: Property): PriceEstimate {
  // Base pricing strategy for Premià de Mar, Spain
  const basePrice = 75; // Base price for the area
  
  let priceAdjustment = 0;
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let method = 'property-based estimation';
  
  // Adjust based on property characteristics
  const amenities = property.amenities.flatMap(a => a.items).map(item => item.toLowerCase());
  
  // Bedroom count adjustment
  const hasTwoBedrooms = property.name.toLowerCase().includes('2br') || 
                         property.name.toLowerCase().includes('2 bedroom') ||
                         amenities.some(a => a.includes('2 bedroom'));
  if (hasTwoBedrooms) {
    priceAdjustment += 25; // 2BR properties cost more
  }
  
  // Air conditioning adjustment
  const hasAC = amenities.some(a => a.includes('air conditioning') || a.includes('ac'));
  if (hasAC) {
    priceAdjustment += 10;
  }
  
  // High-speed wifi adjustment
  const hasHighSpeedWifi = amenities.some(a => a.includes('high speed') && a.includes('wifi'));
  if (hasHighSpeedWifi) {
    priceAdjustment += 5;
  }
  
  // Outdoor space adjustment
  const hasOutdoorSpace = amenities.some(a => 
    a.includes('patio') || a.includes('balcony') || a.includes('terrace') || a.includes('rooftop')
  );
  if (hasOutdoorSpace) {
    priceAdjustment += 15;
  }
  
  // Private rooftop adjustment (premium feature)
  const hasRooftop = property.name.toLowerCase().includes('rooftop') ||
                     property.description.toLowerCase().includes('rooftop');
  if (hasRooftop) {
    priceAdjustment += 20;
    confidence = 'high';
  }
  
  // Ocean view adjustment
  const hasOceanView = amenities.some(a => a.includes('ocean view')) ||
                      property.description.toLowerCase().includes('ocean view');
  if (hasOceanView) {
    priceAdjustment += 10;
  }
  
  // Modern/renovated adjustment
  const isModern = property.name.toLowerCase().includes('modern') ||
                  property.description.toLowerCase().includes('renovated') ||
                  property.description.toLowerCase().includes('modern');
  if (isModern) {
    priceAdjustment += 8;
  }
  
  // Dedicated workspace adjustment (remote work premium)
  const hasWorkspace = amenities.some(a => a.includes('dedicated workspace'));
  if (hasWorkspace) {
    priceAdjustment += 5;
  }
  
  // Calculate final price
  const estimatedPrice = Math.round(basePrice + priceAdjustment);
  
  // Adjust confidence based on data quality
  if (amenities.length > 20) {
    confidence = 'high';
  } else if (amenities.length < 10) {
    confidence = 'low';
  }
  
  return {
    pricePerNight: estimatedPrice,
    currency: 'EUR', // Assuming EUR for Spain
    confidence,
    method
  };
}

export function estimatePriceFromDescription(description: string): number {
  // Simple regex-based price extraction from description
  const pricePatterns = [
    /(\d+)\s*(?:euros?|€)\s*(?:per\s*night|\/night)/gi,
    /(\d+)\s*(?:dollars?|\$)\s*(?:per\s*night|\/night)/gi,
    /(\d+)\s*(?:per\s*night|\/night)/gi
  ];
  
  for (const pattern of pricePatterns) {
    const matches = description.match(pattern);
    if (matches) {
      for (const match of matches) {
        const priceMatch = match.match(/(\d+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1]);
          if (price >= 50 && price <= 500) { // Reasonable price range
            return price;
          }
        }
      }
    }
  }
  
  return 0;
}

export function combinePriceEstimations(property: Property): PriceEstimate {
  // Try to extract from description first
  const descriptionPrice = estimatePriceFromDescription(property.description);
  
  if (descriptionPrice > 0) {
    return {
      pricePerNight: descriptionPrice,
      currency: 'EUR',
      confidence: 'high',
      method: 'description extraction'
    };
  }
  
  // Fall back to property-based estimation
  return estimatePriceFromProperty(property);
}
