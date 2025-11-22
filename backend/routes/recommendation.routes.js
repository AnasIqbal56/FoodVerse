import express from 'express';
import {
    getRecommendations,
    updateUserPreferences,
    trackOrderForRecommendations,
    getTrendingItems
} from '../controllers/recommendation.controllers.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

/**
 * ========================================
 * RECOMMENDATION SYSTEM ROUTES
 * ========================================
 */

// Get personalized recommendations for a user
// GET /api/recommendations/:userId?limit=10
router.get('/:userId', getRecommendations);

// Update user dietary preferences and allergies
// PUT /api/recommendations/preferences/:userId
router.put('/preferences/:userId', isAuth, updateUserPreferences);

// Track order for future recommendations (called after order placement)
// POST /api/recommendations/track-order
router.post('/track-order', isAuth, trackOrderForRecommendations);

// Get trending items across platform
// GET /api/recommendations/trending/items?limit=10
router.get('/trending/items', getTrendingItems);

export default router;
