const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with the URL of your frontend
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200,
  };
  
  app.use(cors(corsOptions));

  
// app.use(cors());

// Available seats in the coach
const totalRows = 11;
const seatsPerRow = 7;
const lastRowSeats = 3;

const totalSeats = (totalRows - 1) * seatsPerRow + lastRowSeats;

const bookedSeats = new Set(); // Set to store booked seat numbers

// Endpoint to fetch all seats and their availability status
app.get('/api/seats', (req, res) => {
  const seats = [];
  for (let row = 1; row <= totalRows; row++) {
    const seatsInRow = row === totalRows ? lastRowSeats : seatsPerRow;
    for (let seat = 1; seat <= seatsInRow; seat++) {
      const seatNumber = (row - 1) * seatsPerRow + seat;
      const isBooked = bookedSeats.has(seatNumber);
      seats.push({ seatId: seatNumber, rowNumber: row, seatNumber: seat, isBooked });
    }
  }
  res.json(seats);
});


// Endpoint to book seats
app.post('/api/seats/book', (req, res) => {
  const { seatCount } = req.body;

  if (seatCount <= 0 || seatCount > seatsPerRow) {
    return res.status(400).json({ error: 'Invalid number of seats requested' });
  }

  const booked = bookSeats(seatCount);
  if (booked.length === 0) {
    return res.status(404).json({ error: 'No available seats' });
  }

  return res.json({ seats: booked });
});

// Helper function to book seats
function bookSeats(count) {
  const booked = [];

  for (let row = 1; row <= totalRows; row++) {
    const seatsInRow = row === totalRows ? lastRowSeats : seatsPerRow;
    let consecutiveCount = 0;
    let startSeat = -1;

    for (let seat = 1; seat <= seatsInRow; seat++) {
      const seatNumber = (row - 1) * seatsPerRow + seat;
      if (bookedSeats.has(seatNumber)) {
        consecutiveCount = 0;
        startSeat = -1;
      } else {
        if (consecutiveCount === 0) {
          startSeat = seat;
        }
        consecutiveCount++;
        if (consecutiveCount === count) {
          for (let i = 0; i < count; i++) {
            const bookedSeat = startSeat + i;
            bookedSeats.add((row - 1) * seatsPerRow + bookedSeat);
            booked.push({ seatId: bookedSeat, rowNumber: row, seatNumber: bookedSeat });
          }
          return booked;
        }
      }
    }
  }

  return booked;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
