import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [requiredSeats, setRequiredSeats] = useState(1);
  const [isFetchingSeats, setIsFetchingSeats] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const fetchSeats = async () => {
    try {
      setIsFetchingSeats(true);
      const response = await axios.get('https://main--coruscating-unicorn-14386a.netlify.app/api/seats');
      setSeats(response.data);
      setIsFetchingSeats(false);
    } catch (error) {
      console.error(error);
      setIsFetchingSeats(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    const updateSelectedSeats = () => {
      setSelectedSeats((prevSelectedSeats) => prevSelectedSeats.slice(0, requiredSeats));
    };

    updateSelectedSeats();
  }, [requiredSeats]);

  const handleSeatClick = (seatId) => {
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((id) => id !== seatId);
      } else {
        if (prevSelectedSeats.length < requiredSeats) {
          return [...prevSelectedSeats, seatId];
        }
        return prevSelectedSeats;
      }
    });
  };

  const handleBookSeats = async () => {
    if (requiredSeats > 7) {
      alert("You can only book a maximum of 7 seats.")
      setMessage('You can only book a maximum of 7 seats.');
      return;
    }

    try {
      setIsBooking(true);
      const bookedCount = seats.filter((seat) => seat.isBooked).length;
      const availableSeatsCount = 80 - bookedCount;
  
      if (availableSeatsCount === 0) {
        setMessage('All seats are booked. No more seats available.');
        setIsBooking(false);
        return;
      }
  
      if (requiredSeats > availableSeatsCount) {
        setMessage(`Only ${availableSeatsCount} seat(s) available. Please choose a lower number of seats.`);
        setIsBooking(false);
        return;
      }

      const response = await axios.post('https://main--coruscating-unicorn-14386a.netlify.app/api/seats/book', { seatCount: requiredSeats });
      console.log('response',response)
      const { seats: bookedSeats } = response.data;
      const seatNumbers = bookedSeats.map((seat) => seat.seatId);
      setMessage(`Seats booked: ${seatNumbers.join(', ')}`);
      setSelectedSeats([]);
      setIsBooking(false);

      fetchSeats();
    } catch (error) {
      console.error(error);
      setMessage('Error occurred while booking seats');
      setIsBooking(false);
    }
  
  };

  const handleRequiredSeatsChange = (event) => {
    setRequiredSeats(parseInt(event.target.value));
  };

  return (
    <div className="container">
      <h1 className="title">Seat Booking</h1>
      <p className="message">{message}</p>
      <div className="seats-container">
        {isFetchingSeats ? (
          <p>Loading seats...</p>
        ) : (
          seats.map((seat) => (
            <div
              key={seat.seatId}
              className={`seat ${seat.isBooked ? 'booked' : selectedSeats.includes(seat.seatId) ? 'selected' : 'available'}`}
              onClick={() => handleSeatClick(seat.seatId)}
            >
              <span className="seat-label">Seat {seat.rowNumber}-{seat.seatNumber}</span>
            </div>
          ))
        )}
      </div>
      <div className="input-container">
        <label className="gap" htmlFor="requiredSeats">{`Number of Seats: `}</label>
        <input
          type="number"
          id="requiredSeats"
          name="requiredSeats"
          min="1"
          value={requiredSeats}
          onChange={handleRequiredSeatsChange}
        />
      </div>
      <button
  className="book-btn"
  onClick={handleBookSeats}
  disabled={isBooking || seats.filter((seat) => !seat.isBooked).length === 0}
>
  {isBooking ? 'Booking...' : `Book ${!requiredSeats?"0":requiredSeats} Seat${requiredSeats !== 1 ? 's' : ''}`}
</button>

    </div>
  );
};

export default App;
