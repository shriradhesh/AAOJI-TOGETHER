const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = require('../utils/uploads')
const adminController = require('../controller/adminController')
const nodemailer = require('nodemailer')

                                  /* API's */

// API for admin login
                router.post('/login_Admin', adminController.login_Admin)
// API for change Admin password
                 router.post('/changePassword/:id', adminController.changePassword)
// Api for generate token for forgetpassword
                 router.post('/forgetPassToken', adminController.forgetPassToken)
// Api for reset password using token
                 router.post('/reset_password/:tokenValue', adminController.reset_password)

module.exports = router