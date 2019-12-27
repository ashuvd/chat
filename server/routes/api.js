var router = require('express').Router();
const AuthController = require('../controllers/authController');

router.post('/auth', AuthController.post);
router.post('/file/upload', AuthController.addFile);

module.exports = router