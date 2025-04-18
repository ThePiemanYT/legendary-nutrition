// filepath: c:\Users\user\Desktop\Stuffs\NutrientKH\routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index.ejs'); // Ensure this renders the correct file
});
router.get('/calculator', (req, res) => res.render('calculator.ejs'));
router.get('/document', (req, res) => res.render('document.ejs'));
router.get('/login', (req, res) => res.render('Login.ejs'));
router.get('/register', (req, res) => res.render('signup.ejs'));
router.get('/profile', (req, res) => res.render('profile.ejs'));

module.exports = router;