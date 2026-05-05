const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Sorosoke APIs are now running' });
});
// Routes
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB connection error:', err);
  });

module.exports = app;