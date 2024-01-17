const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = require('../utils/uploads')
const userController = require('../controller/userController')

                                 /* User APIs */
    // API for signup user
                    router.post('/userSignUp',upload.single('profileImage'), userController.userSignUp)

    // api for update user
                router.post('/updateUser/:id',upload.single('profileImage'), userController.updateUser)
    // API for user Login
                    router.post('/userLogin', userController.userLogin)
    // API for delete user
                    router.delete('/deleteUser/:userId', userController.deleteUser)
   // Api for get user Detail
                    router.get('/getUser/:userId', userController.getUser)

                                  /* Event management */

    // API for create an event
                         router.post('/create_Event/:userId',upload.array('images', 100), userController.create_Event)
     // API for update event by eventId
                        router.post('/updateEvent/:eventId' ,upload.array('images', 100), userController.updateEvent)
    // API for add venue_Date_Time in event
                         router.post('/newVenue_Date_Time/:eventId' , userController.newVenue_Date_Time)
    // API for add co-host in event
                         router.post('/add_co_host/:eventId', userController.add_co_host)
    // APi for get all co-hosts
                          router.get('/getAll_co_Hosts/:eventId', userController.getAll_co_Hosts)
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
    // APi for delete particular guest
                         router.delete('/delete_Guest/:eventId/:guestId', userController.delete_Guest)    
    // API for add all guests of Event into BookMark with collectionName
                         router.post('/addAllGuestsToBookmark/:eventId', userController.addAllGuestsToBookmark)
    // APi for delete a Guest of collection in bookmark model
                        router.delete('/deleteGuestInCollection/:guestId', userController.deleteGuestInCollection) 
    // APi for searchEvent Event by Id
                        router.get('/searchEvent', userController.searchEvent)
   // APi for get filtered event 
                        router.get('/getFilteredEvent', userController.getFilteredEvent)
    // API for delete event using eventId
                        router.delete('/deleteEvent/:eventId', userController.deleteEvent)
    // API for get Images of event
                        router.get('/getImages/:eventId', userController.getImages)
    // API for delete co-host in event
                        router.delete('/delete_co_Host/:co_hostId/:eventId', userController.delete_co_Host)
    // API for getAll Events 
                        router.get('/getAllEvents', userController.getAllEvents)
    // API for get user Event
                        router.get('/getUserEvent/:userId', userController.getUserEvent)

                                      /* Feedback  */
   // API for feedback form
                        router.post('/feedback/:userId/:eventId', userController.feedback)

                                    /* Contact Us */
    
    // API for contact us 
                        router.post('/contactUsPage', userController.contactUsPage)

                                /* FAQ Page  */
    // API for FAQ page
                        router.post('/faqPage', userController.faqPage)
                                
                                /*   Invite Event */
                       router.post('/sendInvitation/:eventId', userController.sendInvitation)
// API for get Invited events of user
                        router.get('/getMyInvitation' , userController.getMyInvitation)
// APi to get event by Id
                        router.get('/getEvent/:eventId', userController.getEvent)
// API for get all Invited Events
                        router.get('/getAllInvited_Event/:userId', userController.getAllInvited_Event)
// APi for get events venue Date and time
                         router.get('/getVenuesOf_Event/:eventId', userController.getVenuesOf_Event)
// API for send response to Invited event by user
                          router.post('/userRespondToInvitedEvent/:eventId' , userController.userRespondToInvitedEvent)
// APi for  getAllGuest_with_Response
                         router.get('/getAllGuest_with_Response/:eventId', userController.getAllGuest_with_Response) 
// APi for  getResponseEvent
                         router.get('/getallResponseEvent', userController.getallResponseEvent) 
// APi for check phone_no existance
                         router.post('/numberExistance', userController.numberExistance)
// Api for getSubEventOf_Event of event
                          router.get('/getSubEventOf_Event/:subEventId/:eventId', userController.getSubEventOf_Event)

// APi for delete all Events
                        router.delete('/deleteAllEvents', userController.deleteAllEvents)
    


                                   /*   Event Album */
// APi for create Event Album
                        router.post('/createEventAlbum/:eventId', userController.createEventAlbum)
// Api for get all Albums of the event
                        router.get('/getAllAlbum/:eventId', userController.getAllAlbum)
// APi for get particular album 
                       router.get('/getParticularAlbum/:eventId/:Album_Id', userController.getParticularAlbum)
// APi for add Images in Album
                        router.post('/addImages_in_Album/:album_id/:image_arrayId', upload.array('images', 100), userController.addImages_in_Album)
// APi for Rename Album
                        router.post('/rename_album/:album_id', userController.rename_album)
// APi for delete Album
                        router.delete('/deleteAlbum/:album_id', userController.deleteAlbum)
// Api for delete Image in Album
                        router.delete('/deleteImage/:image_id/:album_id', userController.deleteImage)
module.exports = router