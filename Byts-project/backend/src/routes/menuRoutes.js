const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const menuController = require('../controllers/menuController');

const router = express.Router();

// Student & caretaker can view week/final menus
router.get('/week', authMiddleware.protect, menuController.getWeek);
router.get('/final', authMiddleware.protect, menuController.getFinal);

// Student-specific
router.get(
    '/my-votes',
    authMiddleware.protect,
    requireRoles('student'),
    menuController.getMyVotes,
);
router.post(
    '/vote',
    authMiddleware.protect,
    requireRoles('student'),
    menuController.vote,
);

// Caretaker / warden
router.post(
    '/week',
    authMiddleware.protect,
    requireRoles('caretaker', 'warden'),
    menuController.createWeek,
);
router.post(
    '/options',
    authMiddleware.protect,
    requireRoles('caretaker', 'warden'),
    menuController.addOptions,
);
router.get(
    '/votes',
    authMiddleware.protect,
    requireRoles('caretaker', 'warden'),
    menuController.getVotes,
);
router.post(
    '/finalize',
    authMiddleware.protect,
    requireRoles('caretaker', 'warden'),
    menuController.finalize,
);
router.get(
    '/weeks',
    authMiddleware.protect,
    requireRoles('caretaker', 'warden'),
    menuController.listWeeks,
);

module.exports = router;

