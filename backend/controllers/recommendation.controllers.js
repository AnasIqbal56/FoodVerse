import User from '../models/user.model.js';
import Item from '../models/item.model.js';

/**
 * ========================================
 * RULE-BASED FOOD RECOMMENDATION ENGINE
 * ========================================
 * 
 * This controller implements a sophisticated rule-based recommendation system
 * that scores items based on user preferences, order history, and item popularity.
 * 
 * Scoring Algorithm:
 * - Previously ordered items: +20 points (strong signal)
 * - Favorite categories: +15 points
 * - Dietary preference match: +10 points
 * - High ratings (>= 4.2): +10 points
 * - Trending items (high sales): +15 points
 * - Tag matching: +5 points per matching tag
 * 
 * Safety Filters:
 * - Excludes items containing user's allergens
 * - Respects dietary restrictions (halal, vegan, etc.)
 */

// ============================================
// GET PERSONALIZED RECOMMENDATIONS
// ============================================
export const getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        // ========== STEP 1: Fetch User Profile ==========
        const user = await User.findById(userId).populate('orderHistory.itemId', 'tags category');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract user preferences
        const {
            dietaryPreference = [],
            allergies = [],
            favoriteCategories = [],
            orderHistory = []
        } = user;

        console.log('📊 User Profile:', {
            userId,
            dietaryPreference,
            allergies,
            favoriteCategories,
            orderHistoryCount: orderHistory.length
        });

        // ========== STEP 2: Fetch and Filter Items ==========
        
        // Build query to filter items
        const itemQuery = {};

        // Exclude items containing allergens
        if (allergies.length > 0) {
            itemQuery.allergens = { $nin: allergies };
        }

        // Filter by dietary preferences if specified
        if (dietaryPreference.length > 0) {
            // If user is veg, exclude non-veg items
            if (dietaryPreference.includes('veg')) {
                itemQuery.foodType = 'veg';
            }
            
            // If user requires halal, only show halal items
            if (dietaryPreference.includes('halal')) {
                itemQuery.dietType = { $in: ['halal'] };
            }
            
            // Match at least one dietary preference
            if (!dietaryPreference.includes('veg') && !dietaryPreference.includes('halal')) {
                itemQuery.dietType = { $in: dietaryPreference };
            }
        }

        console.log('🔍 Item Query Filters:', itemQuery);

        // Fetch all eligible items
        const items = await Item.find(itemQuery).populate('shop', 'name').lean();

        console.log(`📦 Found ${items.length} eligible items`);

        if (items.length === 0) {
            return res.status(200).json({
                userId,
                recommendations: [],
                message: 'No items match your preferences'
            });
        }

        // ========== STEP 3: Score Each Item ==========
        
        // Extract previously ordered item IDs and tags
        const orderedItemIds = new Set(orderHistory.map(oh => oh.itemId?._id?.toString()).filter(Boolean));
        const orderedTags = new Set();
        orderHistory.forEach(oh => {
            if (oh.itemId?.tags) {
                oh.itemId.tags.forEach(tag => orderedTags.add(tag.toLowerCase()));
            }
        });

        // Calculate trending threshold (top 20% of sales)
        const salesCounts = items.map(item => item.salesCount || 0).sort((a, b) => b - a);
        const trendingThreshold = salesCounts[Math.floor(salesCounts.length * 0.2)] || 10;

        console.log(`📈 Trending Threshold: ${trendingThreshold} sales`);

        // Score each item
        const scoredItems = items.map(item => {
            let score = 0;
            const reasons = []; // For debugging/explanation

            // +20: Previously ordered
            if (orderedItemIds.has(item._id.toString())) {
                score += 20;
                reasons.push('Previously ordered (+20)');
            }

            // +15: Favorite category
            if (favoriteCategories.includes(item.category)) {
                score += 15;
                reasons.push(`Favorite category: ${item.category} (+15)`);
            }

            // +10: Dietary preference match
            if (item.dietType && item.dietType.length > 0) {
                const matchingDiets = item.dietType.filter(diet => 
                    dietaryPreference.includes(diet)
                );
                if (matchingDiets.length > 0) {
                    score += 10;
                    reasons.push(`Diet match: ${matchingDiets.join(', ')} (+10)`);
                }
            }

            // +10: High rating
            if (item.rating?.average >= 4.2) {
                score += 10;
                reasons.push(`High rating: ${item.rating.average.toFixed(1)} (+10)`);
            }

            // +15: Trending item
            if (item.salesCount >= trendingThreshold) {
                score += 15;
                reasons.push(`Trending: ${item.salesCount} sales (+15)`);
            }

            // +5 per matching tag
            if (item.tags && item.tags.length > 0) {
                const matchingTags = item.tags.filter(tag => 
                    orderedTags.has(tag.toLowerCase())
                );
                if (matchingTags.length > 0) {
                    const tagScore = matchingTags.length * 5;
                    score += tagScore;
                    reasons.push(`Tag match: ${matchingTags.join(', ')} (+${tagScore})`);
                }
            }

            return {
                itemId: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                category: item.category,
                foodType: item.foodType,
                spiceLevel: item.spiceLevel,
                dietType: item.dietType,
                tags: item.tags,
                rating: item.rating?.average || 0,
                ratingCount: item.rating?.count || 0,
                salesCount: item.salesCount,
                shop: item.shop,
                score,
                reasons // Include reasoning for transparency
            };
        });

        // ========== STEP 4: Sort by Score and Return Top N ==========
        
        // Sort by score (descending), then by rating, then by sales
        scoredItems.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.salesCount - a.salesCount;
        });

        // Get top N recommendations
        const recommendations = scoredItems.slice(0, limit);

        console.log('🎯 Top Recommendations:', recommendations.slice(0, 3).map(r => ({
            name: r.name,
            score: r.score,
            reasons: r.reasons
        })));

        return res.status(200).json({
            userId,
            totalEligibleItems: items.length,
            recommendations: recommendations.map(r => ({
                itemId: r.itemId,
                name: r.name,
                image: r.image,
                price: r.price,
                category: r.category,
                foodType: r.foodType,
                spiceLevel: r.spiceLevel,
                dietType: r.dietType,
                tags: r.tags,
                rating: r.rating,
                ratingCount: r.ratingCount,
                salesCount: r.salesCount,
                shop: r.shop,
                score: r.score,
                // reasons: r.reasons // Uncomment for debugging
            })),
            filters: {
                dietaryPreference,
                allergies,
                favoriteCategories
            }
        });

    } catch (error) {
        console.error('❌ Recommendation Error:', error);
        return res.status(500).json({ 
            message: 'Error generating recommendations',
            error: error.message 
        });
    }
};

// ============================================
// UPDATE USER PREFERENCES
// ============================================
export const updateUserPreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { dietaryPreference, allergies, favoriteCategories } = req.body;

        const updateData = {};
        
        if (dietaryPreference !== undefined) {
            updateData.dietaryPreference = dietaryPreference;
        }
        if (allergies !== undefined) {
            updateData.allergies = allergies;
        }
        if (favoriteCategories !== undefined) {
            updateData.favoriteCategories = favoriteCategories;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('dietaryPreference allergies favoriteCategories');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ Updated user preferences:', user);

        return res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: user
        });

    } catch (error) {
        console.error('❌ Update Preferences Error:', error);
        return res.status(500).json({ 
            message: 'Error updating preferences',
            error: error.message 
        });
    }
};

// ============================================
// TRACK ORDER FOR RECOMMENDATIONS
// ============================================
export const trackOrderForRecommendations = async (req, res) => {
    try {
        const { userId, itemIds } = req.body; // itemIds is array of ordered item IDs

        if (!itemIds || itemIds.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update order history
        for (const itemId of itemIds) {
            const existingIndex = user.orderHistory.findIndex(
                oh => oh.itemId.toString() === itemId.toString()
            );

            if (existingIndex >= 0) {
                // Increment times ordered
                user.orderHistory[existingIndex].timesOrdered += 1;
                user.orderHistory[existingIndex].lastOrderedAt = new Date();
            } else {
                // Add new item to order history
                user.orderHistory.push({
                    itemId,
                    timesOrdered: 1,
                    lastOrderedAt: new Date()
                });
            }

            // Increment sales count for the item
            await Item.findByIdAndUpdate(itemId, {
                $inc: { salesCount: 1 }
            });
        }

        // Auto-update favorite categories based on order history
        const items = await Item.find({ _id: { $in: itemIds } }).select('category');
        const categories = items.map(item => item.category);
        
        // Add to favorite categories if not already there
        categories.forEach(cat => {
            if (!user.favoriteCategories.includes(cat)) {
                user.favoriteCategories.push(cat);
            }
        });

        await user.save();

        console.log('✅ Order tracked for recommendations:', {
            userId,
            itemCount: itemIds.length
        });

        return res.status(200).json({
            message: 'Order tracked successfully',
            orderHistoryCount: user.orderHistory.length,
            favoriteCategories: user.favoriteCategories
        });

    } catch (error) {
        console.error('❌ Track Order Error:', error);
        return res.status(500).json({ 
            message: 'Error tracking order',
            error: error.message 
        });
    }
};

// ============================================
// GET TRENDING ITEMS
// ============================================
export const getTrendingItems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get items sorted by sales count
        const trendingItems = await Item.find()
            .sort({ salesCount: -1, 'rating.average': -1 })
            .limit(limit)
            .populate('shop', 'name')
            .lean();

        return res.status(200).json({
            trending: trendingItems.map(item => ({
                itemId: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                category: item.category,
                rating: item.rating?.average || 0,
                ratingCount: item.rating?.count || 0,
                salesCount: item.salesCount,
                tags: item.tags,
                shop: item.shop
            }))
        });

    } catch (error) {
        console.error('❌ Trending Items Error:', error);
        return res.status(500).json({ 
            message: 'Error fetching trending items',
            error: error.message 
        });
    }
};
