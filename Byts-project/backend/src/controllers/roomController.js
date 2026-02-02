const Room = require('../models/Room');
const User = require('../models/User');
const RoomRequest = require('../models/RoomRequest');
const MateRequest = require('../models/MateRequest');

const getAvailableRooms = async (req, res) => {
    try {
        const { type, hostel } = req.query;
        console.log('Fetching rooms for:', { type, hostel });

        const query = { isFull: false };
        if (type) query.type = Number(type);
        if (hostel) query.hostel = { $regex: new RegExp(`^${hostel}$`, 'i') };

        console.log('Room query:', JSON.stringify(query));
        const rooms = await Room.find(query);
        console.log('Rooms found:', rooms.length);
        res.json(rooms);
    } catch (error) {
        console.error('Error in getAvailableRooms:', error);
        res.status(500).json({ message: error.message });
    }
};

const getEligibleStudents = async (req, res) => {
    try {
        const { hostel, excludeUserId } = req.query;
        console.log('Fetching students for:', { hostel, excludeUserId });
        const query = {
            hostel: { $regex: new RegExp(`^${hostel}$`, 'i') },
            role: 'student',
            hasRoom: false
        };
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        console.log('Student query:', JSON.stringify(query));
        const students = await User.find(query).select('name email rollNo');
        console.log('Students found:', students.length);
        res.json(students);
    } catch (error) {
        console.error('Error in getEligibleStudents:', error);
        res.status(500).json({ message: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const { roomId, initiatorId, roommateIds } = req.body;

        // Check if initiator or roommates already have rooms
        const allIds = [initiatorId, ...roommateIds];
        const students = await User.find({ _id: { $in: allIds } });
        const alreadyAllocated = students.find(s => s.hasRoom);
        if (alreadyAllocated) {
            return res.status(400).json({ message: `${alreadyAllocated.name} already has a room.` });
        }

        // Check if room is already full
        const room = await Room.findById(roomId);
        if (room.isFull) return res.status(400).json({ message: 'Room is full.' });

        const roommates = roommateIds.map(id => ({ student: id, status: 'pending' }));

        const newRequest = await RoomRequest.create({
            room: roomId,
            initiator: initiatorId,
            roommates
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const requests = await RoomRequest.find({
            $or: [
                { initiator: userId },
                { 'roommates.student': userId }
            ],
            status: 'pending'
        })
            .populate('room')
            .populate('initiator', 'name rollNo')
            .populate('roommates.student', 'name rollNo');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const respondToRequest = async (req, res) => {
    try {
        const { requestId, studentId, status } = req.body; // status: 'accepted' or 'rejected'

        const request = await RoomRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const roommate = request.roommates.find(r => r.student.toString() === studentId);
        if (!roommate) return res.status(400).json({ message: 'Student not part of this request' });

        roommate.status = status;

        if (status === 'rejected') {
            request.status = 'cancelled';
        } else {
            // Check if all accepted
            const allAccepted = request.roommates.every(r => r.status === 'accepted');
            if (allAccepted) {
                // Finalize allocation
                const room = await Room.findById(request.room);
                if (room.isFull) {
                    request.status = 'cancelled';
                    await request.save();
                    return res.status(400).json({ message: 'Room was booked by someone else.' });
                }

                const studentIds = [request.initiator, ...request.roommates.map(r => r.student)];
                room.students = studentIds;
                room.isFull = true;
                await room.save();

                await User.updateMany(
                    { _id: { $in: studentIds } },
                    { $set: { hasRoom: true, roomId: room._id } }
                );

                request.status = 'completed';
            }
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyRoom = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.roomId) {
            return res.status(404).json({ message: 'No room allocated yet.' });
        }

        const room = await Room.findById(user.roomId).populate('students', 'name rollNo email');
        if (!room) {
            // If room doesn't exist (e.g. re-seeded), reset student state
            user.hasRoom = false;
            user.roomId = undefined;
            await user.save();
            return res.status(404).json({ message: 'Allocated room no longer exists.' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMateRequest = async (req, res) => {
    try {
        const { roomId, initiatorId, existingRoommateIds, hostel, sharingType } = req.body;

        // Check if anyone already has a room
        const allIds = [initiatorId, ...existingRoommateIds];
        const students = await User.find({ _id: { $in: allIds } });
        const alreadyAllocated = students.find(s => s.hasRoom);
        if (alreadyAllocated) {
            return res.status(400).json({ message: `${alreadyAllocated.name} already has a room.` });
        }

        // Check if a request already exists for this initiator
        const existing = await MateRequest.findOne({ initiator: initiatorId, status: 'open' });
        if (existing) {
            return res.status(400).json({ message: 'You already have an open roommate request.' });
        }

        const newMateReq = await MateRequest.create({
            room: roomId,
            initiator: initiatorId,
            existingRoommates: existingRoommateIds,
            hostel,
            sharingType,
            status: 'open'
        });

        res.status(201).json(newMateReq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOpenMateRequests = async (req, res) => {
    try {
        const { hostel } = req.query;
        const query = { status: 'open' };
        if (hostel) {
            query.hostel = { $regex: new RegExp(`^${hostel}$`, 'i') };
        }

        const requests = await MateRequest.find(query)
            .populate('initiator', 'name rollNo')
            .populate('existingRoommates', 'name rollNo')
            .populate('room', 'roomNumber');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const applyForMateRequest = async (req, res) => {
    try {
        const { requestId, studentId } = req.body;

        const request = await MateRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'open') return res.status(400).json({ message: 'Request is no longer open' });

        // Check if already applied
        const alreadyApplied = request.applicants.find(a => a.student.toString() === studentId);
        if (alreadyApplied) return res.status(400).json({ message: 'You have already applied to this request' });

        // Check if student is initiator or existing roommate
        if (request.initiator.toString() === studentId || request.existingRoommates.includes(studentId)) {
            return res.status(400).json({ message: 'You are already part of this group' });
        }

        request.applicants.push({ student: studentId, status: 'pending' });
        await request.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleMateApplication = async (req, res) => {
    try {
        const { requestId, applicantId, status } = req.body; // status: 'accepted' or 'rejected'

        const request = await MateRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const applicant = request.applicants.find(a => a.student.toString() === applicantId);
        if (!applicant) return res.status(400).json({ message: 'Applicant not found' });

        applicant.status = status;

        if (status === 'accepted') {
            // Check if room is full now
            const totalPeople = 1 + request.existingRoommates.length + 1; // initiator + existing + new accepted
            if (totalPeople === request.sharingType) {
                // Finalize everything
                const room = await Room.findById(request.room);
                if (room.isFull) {
                    request.status = 'cancelled';
                    await request.save();
                    return res.status(400).json({ message: 'Room was booked by someone else.' });
                }

                const studentIds = [request.initiator, ...request.existingRoommates, applicantId];
                room.students = studentIds;
                room.isFull = true;
                await room.save();

                await User.updateMany(
                    { _id: { $in: studentIds } },
                    { $set: { hasRoom: true, roomId: room._id } }
                );

                request.status = 'closed';
                // Reject all other pending applicants
                request.applicants.forEach(a => {
                    if (a.status === 'pending') a.status = 'rejected';
                });
            } else {
                // Room not full yet, move applicant to existingRoommates
                request.existingRoommates.push(applicantId);
                // Remove from applicants array or leave as accepted? Let's leave as accepted but move to existing.
                // Actually, existingRoommates is better for tracking.
            }
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyMateRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const requests = await MateRequest.find({
            $or: [
                { initiator: userId },
                { 'applicants.student': userId },
                { existingRoommates: userId }
            ]
        })
            .populate('initiator', 'name rollNo')
            .populate('existingRoommates', 'name rollNo')
            .populate('applicants.student', 'name rollNo')
            .populate('room', 'roomNumber');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};

