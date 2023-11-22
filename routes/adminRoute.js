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
// API for change ProfileImage also update
                 router.post('/changeProfile/:AdminId',upload.single('profileImage'), adminController.changeProfile)
// API for getAll Events 
                 router.get('/getAllEvents', adminController.getAllEvents)
// API for get all Guests of a collection in Bookmark model
                  router.get('/getCollectionGuests', adminController.getCollectionGuests)
// API for get all feedbacks of a event
                  router.get('/getFeedbacksofEvent/:eventId', adminController.getFeedbacksofEvent)
// API for get admin details
                  router.get('/getAdmin/:adminId' , adminController.getAdmin)


module.exports = router