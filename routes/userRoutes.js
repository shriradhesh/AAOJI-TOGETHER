const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = require('../utils/uploads')
const userController = require('../controller/userController')

                                 /* User APIs */
    // API for signup user
                    router.post('/userSignUp',upload.single('profileImage'), userController.userSignUp)
    // API for user Login
                    router.post('/userLogin', userController.userLogin)

                                  /* Event management */

    // API for create an event
                         router.post('/create_Event',upload.array('images', 10), userController.create_Event)
    // API for add venue_Date_Time in event
                         router.post('/newVenue_Date_Time/:eventId' , userController.newVenue_Date_Time)
    // API for add co-host in event
                         router.post('/add_co_host/:eventId', userController.add_co_host)
    // API for edit venue_Date_Time in event
                         router.put('/edit_Venue_Date_Time/:venueId/:eventId' , userController.edit_Venue_Date_Time)
    // API for delete delete_Venue_Date_Time in event
                        router.delete('/delete_Venue_Date_Time/:venueId/:eventId', userController.delete_Venue_Date_Time)
    // APi for add guest in event
                        router.post('/add_guest/:eventId', userController.add_guest)
    // API for import guest Data in event                      
                         router.post('/import_Guest/:eventId', upload.single('file') , userController.import_Guest)
    // API for getAllGuest in event
                         router.get('/getAllGuest/:eventId', userController.getAllGuest)    
    // API for add all guests of Event into BookMark with collectionName
                         router.post('/addAllGuestsToBookmark/:eventId', userController.addAllGuestsToBookmark)
    // APi for delete a Guest of collection in bookmark model
                        router.delete('/deleteGuestInCollection/:guestId', userController.deleteGuestInCollection) 
    // APi for get Event by Id
                        router.get('/getEvent/:eventId', userController.getEvent)
   // APi for get filtered event 
                        router.get('/getFilteredEvent', userController.getFilteredEvent)
    // API for delete event using eventId
                        router.delete('/deleteEvent/:eventId', userController.deleteEvent)
   // API for feedback form
                        router.post('/feedback/:eventId', userController.feedback)
    // API for delete user
                        router.delete('/deleteUser/:userId', userController.deleteUser)
    // API for get Images of event
                        router.get('/getImages/:eventId', userController.getImages)
    

module.exports = router