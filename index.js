// Load environment variables from .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const _ = require('lodash');

// Initialize express app
const app = express();

// Apply middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));

// Logger setup with winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' })
  ]
});

// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to the Express App!');
});

// Connect to MongoDB using mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB...');
}).catch((err) => {
  logger.error('Could not connect to MongoDB...', err);
});

// Hash a password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  logger.info('Password hashed:', hashed);
  return hashed;
};

// Generate a JWT token
const generateAuthToken = (user) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  logger.info('JWT token generated:', token);
  return token;
};

// Send email using nodemailer
const sendEmail = async (email, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully!');
  } catch (err) {
    logger.error('Error sending email:', err);
  }
};

// Sample API call using axios
const fetchApiData = async () => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    logger.info('API Data fetched:', response.data);
  } catch (err) {
    logger.error('Error fetching API data:', err);
  }
};

// Test lodash by performing a deep clone
const deepCloneExample = () => {
  const obj = { name: 'John', address: { city: 'New York' } };
  const clonedObj = _.cloneDeep(obj);
  logger.info('Original:', obj);
  logger.info('Cloned:', clonedObj);
};

// Main function to test all functionalities
const main = async () => {
  await hashPassword('supersecretpassword');
  generateAuthToken({ _id: '12345' });
  await sendEmail('example@example.com', 'Test Email', 'This is a test email.');
  await fetchApiData();
  deepCloneExample();
};

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}...`);
  main(); // Execute main functionality
});