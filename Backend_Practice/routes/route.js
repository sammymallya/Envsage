const express = require('express');
const router = express.Router();
const userController= require('../controllers/controller');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/signup',userController.signup);  // maps POST /signup to addUser()
router.get('/fetchAll',verifyToken,userController.fetchAllUsers);
router.get('/fetchUser',verifyToken,userController.fetchByEmail);
router.post('/login',userController.login);

router.get('/update',verifyToken,userController.update);
module.exports = router;