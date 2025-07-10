const express = require('express');
const router = express.Router();
const userController= require('../controllers/controller');
// const verifyToken = require('../middlewares/authMiddleware');

router.post('/signup',userController.signup);  // maps POST /signup to addUser()
router.post('/login', userController.login);
router.post('/submit',userController.submitProfile);

// router.patch('/update',verifyToken,userController.update);

router.get('/career-data', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '/Users/sammy/Desktop/Coding/GitHub/Envsage/openAI_proj/backend/storage/data.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Could not read career data.');
        }
        res.type('text/plain').send(data);
    });
});

module.exports = router;