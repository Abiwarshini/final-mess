import React, { useState, useEffect } from 'react';
import './style.css';

const RoomAllocation = () => {
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([{ name: '', contact: '' }]);
  const [successMessage, setSuccessMessage] = useState('');

  const hostels = ['Kaveri', 'Amaravathi','Narmada'];
  const capacities = ['2 Members', '3 Members', '4 Members'];

  // Mock room data - in real app, this would come from API
  const generateMockRooms = (hostel, capacity) => {
    const capacityNum = parseInt(capacity.split(' ')[0]);
    const mockRooms = [];
    
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 10; room++) {
        const roomNumber = `${floor}${String(room).padStart(2, '0')}`;
        const randomStatus = Math.random();
        
        let status = 'empty';
        let occupants = [];
        
        if (randomStatus < 0.3) {
          status = 'booked';
          occupants = Array(capacityNum).fill(null).map((_, i) => ({
            name: `Student ${roomNumber}${i + 1}`,
            contact: `987654321${i}`
          }));
        } else if (randomStatus < 0.6) {
          status = 'hold';
          const occupantCount = Math.floor(Math.random() * (capacityNum - 1)) + 1;
          occupants = Array(occupantCount).fill(null).map((_, i) => ({
            name: `Student ${roomNumber}${i + 1}`,
            contact: `987654321${i}`
          }));
        }
        
        mockRooms.push({
          id: `${hostel}-${roomNumber}`,
          number: roomNumber,
          capacity: capacityNum,
          status,
          occupants,
          floor
        });
      }
    }
    
    return mockRooms;
  };

  useEffect(() => {
    if (selectedHostel && selectedCapacity) {
      const mockRooms = generateMockRooms(selectedHostel, selectedCapacity);
      setRooms(mockRooms);
    } else {
      setRooms([]);
    }
  }, [selectedHostel, selectedCapacity]);

  const getRoomColor = (status) => {
    switch (status) {
      case 'booked': return '#E2E8F0'; // Muted light gray-blue
      case 'hold': return '#BFDFFF'; // Gentle pastel blue
      case 'empty': return '#F5FAFF'; // Very light blue
      default: return '#ffffff';
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === 'booked') return;
    
    setSelectedRoom(room);
    setShowModal(true);
    setMembers([{ name: '', contact: '' }]);
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMemberField = () => {
    if (members.length < selectedRoom.capacity) {
      setMembers([...members, { name: '', contact: '' }]);
    }
  };

  const removeMemberField = (index) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate at least one member
    const validMembers = members.filter(m => m.name.trim() && m.contact.trim());
    if (validMembers.length === 0) {
      alert('Please add at least one member with valid details');
      return;
    }

    // Update room status
    const updatedRooms = rooms.map(room => {
      if (room.id === selectedRoom.id) {
        const allOccupants = [...room.occupants, ...validMembers];
        return {
          ...room,
          status: allOccupants.length >= room.capacity ? 'booked' : 'hold',
          occupants: allOccupants
        };
      }
      return room;
    });
    
    setRooms(updatedRooms);
    setShowModal(false);
    setSuccessMessage(`Room ${selectedRoom.number} allocated successfully!`);
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  return (
    <div className="room-allocation-container">
      <h2 className="page-title">Room Allocation</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="hostel-select">Select Hostel:</label>
          <select
            id="hostel-select"
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">Choose Hostel</option>
            {hostels.map(hostel => (
              <option key={hostel} value={hostel}>{hostel}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="capacity-select">Room Capacity:</label>
          <select
            id="capacity-select"
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="filter-dropdown"
            disabled={!selectedHostel}
          >
            <option value="">Choose Capacity</option>
            {capacities.map(capacity => (
              <option key={capacity} value={capacity}>{capacity}</option>
            ))}
          </select>
        </div>
      </div>

      {rooms.length > 0 && (
        <div className="rooms-section">
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#E2E8F0' }}></div>
              <span>Fully Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#BFDFFF' }}></div>
              <span>Partially Occupied</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#F5FAFF', border: '1px solid #4A90E2' }}></div>
              <span>Available</span>
            </div>
          </div>

          {Object.entries(groupedRooms).map(([floor, floorRooms]) => (
            <div key={floor} className="floor-section">
              <h3 className="floor-title">Floor {floor}</h3>
              <div className="rooms-grid">
                {floorRooms.map(room => (
                  <div
                    key={room.id}
                    className={`room-card ${room.status === 'booked' ? 'booked' : room.status === 'hold' ? 'hold' : 'empty'}`}
                    style={{ backgroundColor: getRoomColor(room.status) }}
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className="room-number">Room {room.number}</div>
                    <div className="room-capacity">{room.capacity} Members</div>
                    <div className="room-status">
                      {room.status === 'booked' && 'Fully Booked'}
                      {room.status === 'hold' && `${room.occupants.length}/${room.capacity} Occupied`}
                      {room.status === 'empty' && 'Available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Allocate Room {selectedRoom.number}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            {selectedRoom.occupants.length > 0 && (
              <div className="existing-occupants">
                <h4>Existing Members:</h4>
                {selectedRoom.occupants.map((occupant, index) => (
                  <div key={index} className="occupant-info">
                    <span>{occupant.name}</span>
                    <span>{occupant.contact}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="allocation-form">
              <div className="members-section">
                <h4>Add Members ({members.length}/{selectedRoom.capacity}):</h4>
                {members.map((member, index) => (
                  <div key={index} className="member-field">
                    <input
                      type="text"
                      placeholder="Member Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Contact Number"
                      value={member.contact}
                      onChange={(e) => handleMemberChange(index, 'contact', e.target.value)}
                      pattern="[0-9]{10}"
                      required
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        className="remove-member-btn"
                        onClick={() => removeMemberField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                {members.length < selectedRoom.capacity && (
                  <button
                    type="button"
                    className="add-member-btn"
                    onClick={addMemberField}
                  >
                    + Add Member
                  </button>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Allocate Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAllocation;
