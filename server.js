const express = require('express');
const https = require('https');
const fs = require('fs'); // Add this to read SSL certificate files
const app = express();
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443; // Add HTTPS port

// Load SSL certificate and private key
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')), // Replace with your key file path
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')), // Replace with your cert file path
};

app.use(morgan('dev'));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://pagead2.googlesyndication.com", "'unsafe-inline'"],
      imgSrc: ["'self'", "https://flagcdn.com", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrcAttr: null, // Removed as it's not a valid directive
    },
  })
);
app.use(compression());
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes');
app.use('/', (req, res, next) => {
  console.log(`Request received for: ${req.url}`); // Debugging line
  next();
});
app.use('/', routes);

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use((req, res) => {
  res.status(404).render('404.ejs', { message: 'Page not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

// Start HTTPS server
https.createServer(sslOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
  console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

// Start HTTP server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});