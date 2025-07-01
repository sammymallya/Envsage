const express = require('express');
const router = express.Router();
const userController= require('../controllers/controller');

router.post('/signup',userController.signup);  // maps POST /signup to addUser()
router.get('/fetchAll',userController.fetchAllUsers);
router.get('/fetchUser',userController.fetchByEmail);
router.post('/login',userController.login);
module.exports = router;