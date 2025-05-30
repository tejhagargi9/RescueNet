require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const disasterAlertRoutes = require('./routes/disasterAlertRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiApiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  // origin: process.env.FRONTEND_URL, 
  origin: '*',
  credentials: true
}));

app.use(express.json());


// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/alerts', disasterAlertRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiApiRoutes);


// Root route for testing
app.get('/', (req, res) => {
  res.send('RescueNet API Running');
});

// Error Handling Middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));