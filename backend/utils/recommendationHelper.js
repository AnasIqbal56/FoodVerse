/**
 * ========================================
 * RECOMMENDATION SYSTEM HELPER UTILITIES
 * ========================================
 */

/**
 * Calculate similarity score between two arrays
 * Used for matching tags, preferences, etc.
 */
export const calculateArraySimilarity = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = [...set1].filter(item => set2.has(item));
    const union = new Set([...set1, ...set2]);
    
    return intersection.length / union.size; // Jaccard similarity
};

/**
 * Get recency weight for order history
 * More recent orders have higher weight
 */
export const getRecencyWeight = (lastOrderedAt) => {
    if (!lastOrderedAt) return 0;
    
    const daysSinceOrder = (Date.now() - new Date(lastOrderedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: items ordered recently get higher weight
    if (daysSinceOrder <= 7) return 1.0; // Within a week: full weight
    if (daysSinceOrder <= 30) return 0.7; // Within a month: 70%
    if (daysSinceOrder <= 90) return 0.4; // Within 3 months: 40%
    return 0.2; // Older than 3 months: 20%
};

/**
 * Normalize score to 0-100 range
 */
export const normalizeScore = (score, maxScore) => {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
};

/**
 * Check if item matches dietary restrictions
 */
export const matchesDietaryRestrictions = (item, userPreferences) => {
    const { dietaryPreference = [], allergies = [] } = userPreferences;
    
    // Check allergens
    if (allergies.length > 0 && item.allergens) {
        const hasAllergen = item.allergens.some(allergen => 
            allergies.includes(allergen)
        );
        if (hasAllergen) return false;
    }
    
    // Check dietary preferences
    if (dietaryPreference.length > 0) {
        // Veg users should only see veg items
        if (dietaryPreference.includes('veg') && item.foodType === 'non veg') {
            return false;
        }
        
        // Halal requirement
        if (dietaryPreference.includes('halal')) {
            if (!item.dietType || !item.dietType.includes('halal')) {
                return false;
            }
        }
        
        // Vegan requirement (stricter than veg)
        if (dietaryPreference.includes('vegan')) {
            if (!item.dietType || !item.dietType.includes('vegan')) {
                return false;
            }
        }
    }
    
    return true;
};

/**
 * Get diversity bonus to avoid recommending too similar items
 */
export const getDiversityBonus = (recommendedCategories, itemCategory) => {
    const categoryCount = recommendedCategories.filter(cat => cat === itemCategory).length;
    
    // Penalize if we already have many items from this category
    if (categoryCount === 0) return 5; // First item from category: bonus
    if (categoryCount <= 2) return 0; // 2-3 items: neutral
    return -5; // More than 3: penalty
};

/**
 * Calculate personalization strength score (0-100)
 * Higher score means recommendations are more personalized
 */
export const getPersonalizationStrength = (user) => {
    let score = 0;
    
    if (user.orderHistory && user.orderHistory.length > 0) {
        score += Math.min(user.orderHistory.length * 5, 40); // Max 40 points
    }
    
    if (user.favoriteCategories && user.favoriteCategories.length > 0) {
        score += Math.min(user.favoriteCategories.length * 10, 30); // Max 30 points
    }
    
    if (user.dietaryPreference && user.dietaryPreference.length > 0) {
        score += 15;
    }
    
    if (user.allergies && user.allergies.length > 0) {
        score += 15;
    }
    
    return Math.min(score, 100);
};

export default {
    calculateArraySimilarity,
    getRecencyWeight,
    normalizeScore,
    matchesDietaryRestrictions,
    getDiversityBonus,
    getPersonalizationStrength
};
