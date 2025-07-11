const express = require('express');
const router = express.Router();
const userController= require('../controllers/controller');
// const verifyToken = require('../middlewares/authMiddleware');

router.post('/signup',userController.signup);  // maps POST /signup to addUser()
router.post('/login', userController.login);
router.post('/submit',userController.submitProfile);

router.get('/fetchdata',userController.fetchData);

module.exports = router;