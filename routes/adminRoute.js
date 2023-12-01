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
// API for create Demo event
                  router.post('/create_DemoEvent/:adminId',upload.array('images', 10), adminController.create_DemoEvent)
// API for get all Guests of a collection in Bookmark model
                  router.get('/getCollectionGuests', adminController.getCollectionGuests)
// API for get all feedbacks of a event
                  router.get('/getFeedbacksofEvent/:eventId', adminController.getFeedbacksofEvent)
// API for get admin details
                  router.get('/getAdmin/:adminId' , adminController.getAdmin)
// API for get demo Event 
                 router.get('/getDemoEvent', adminController.getDemoEvent)
// APi for checkAndToggleStatus of event
                router.post('/checkAndToggleStatus/:eventId', adminController.checkAndToggleStatus)
// API for delete feedback of event
                 router.delete('/deleteFeedback_OfEvent/:eventId/:feedbackId', adminController.deleteFeedback_OfEvent)
// API for create and Update term and condition
                 router.post('/termAndCondition' , adminController.termAndCondition)
// API for get TermAndCondition
                 router.get('/getTermAndCondition', adminController.getTermAndCondition)
// API for create and update privacy and policy
                  router.post('/privacyAndPolicy', adminController.privacyAndPolicy)
// API for get Privacy_and_Policy
                  router.get('/getPrivacy_and_Policy', adminController.getPrivacy_and_Policy)
// APi for get all feedback
                  router.get('/getAllFeedback', adminController.getAllFeedback)


module.exports = router