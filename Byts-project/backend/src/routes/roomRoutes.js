const express = require('express');
const router = express.Router();
const {
    getAvailableRooms,
    getEligibleStudents,
    createRequest,
    getMyRequests,
    respondToRequest,
    getMyRoom,
    createMateRequest,
    getOpenMateRequests,
    applyForMateRequest,
    handleMateApplication,
    getMyMateRequests
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/available', getAvailableRooms);
router.get('/eligible-students', getEligibleStudents);
router.post('/request', createRequest);
router.get('/requests/:userId', getMyRequests);
router.post('/request/respond', respondToRequest);
router.get('/my-room', protect, getMyRoom);

// Mate Search Routes
router.post('/mate-request', createMateRequest);
router.get('/mate-requests/open', getOpenMateRequests);
router.post('/mate-request/apply', applyForMateRequest);
router.post('/mate-request/handle-app', handleMateApplication);
router.get('/mate-requests/my/:userId', getMyMateRequests);

module.exports = router;
