const userModel = require('../models/userModel')
const eventModel = require('../models/eventModel')
const bookmarkModel = require('../models/bookmarkModel')
const feedbackModel = require('../models/feedbackModel')
const AdminNotificationDetail = require('../models/AdminNotification')
const cors = require('cors')
const upload = require('../utils/uploads')
const fs = require('fs')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const path = require('path')
const ExcelJs = require('exceljs')
const eventImageModel = require('../models/eventImages')
const contactUs = require('../models/contactUs')
const InvitedeventModel = require('../models/Invitation')
const eventFeedModel = require('../models/eventFeedModel')

const Admin = require('../models/AdminModel')
const faqModel = require('../models/FaQ')

const fast2sms = require('fast-two-sms')
const twilio = require('twilio');
const phoneUtil = require('libphonenumber-js');
const userResponseEventModel = require('../models/userResponseEvent')
const accountSid = 'AC126e34876c0bcb57eca92293dedfbc93';
const authToken = '45a257477425131532341d7c50154269';
const twilioPhone  = '+17078202575'; 
const twilioClient = new twilio(accountSid, authToken);
const axios = require('axios');
const { TrustProductsEntityAssignmentsPage } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments')
                                /* API for users */
    // API for user signup
     
    const userSignUp = async (req, res) => {
      try {
          const { fullName, phone_no, email } = req.body;
  
          // Validation
          const requiredFields = ['fullName', 'phone_no'];
          for (const field of requiredFields) {
              if (!req.body[field]) {
                  return res.status(400).json({
                      success: false,
                      message: `Missing ${field.replace('_', ' ')} field`,
                  });
              }
          }
  
          // Check if phone number already exists
          const existPhoneNumber = await userModel.findOne({ phone_no });
          if (existPhoneNumber) {
              return res.status(400).json({
                  success: false,
                  message: 'User with the same number already exists',
              });
          }
  
          // Save user
          const imagePath = req.file ? req.file.filename : null; // Check if a file is uploaded
          const newUser = new userModel({
              fullName,
              phone_no,
              profileImage: imagePath,
              user_status: userModel.schema.path('user_status').getDefault(),
              email: email || null, 
          });
  
          const saveUser = await newUser.save();
  
          // Response
          res.status(200).json({
              success: true,
              message: 'User created successfully',
              user_details: {
                  fullName: saveUser.fullName,
                  phone_no: saveUser.phone_no,
                  profileImage: saveUser.profileImage,
                  userId: saveUser._id,
                  user_status: saveUser.user_status,
                  email: saveUser.email,
              },
          });
      } catch (error) {
          console.error(error);
          res.status(500).json({
              success: false,
              message: 'There is a server error',
          });
      }
  };
  
      // update user
      const updateUser = async (req, res) => {
        try {
          const id = req.params.id;
          const { fullName, phone_no, email } = req.body;
          const user = await userModel.findOne({ _id: id });
      
          // Check for user existence
          if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
      
          user.fullName = fullName;
      
          // Validate and update Phone number
          if (phone_no) {
            user.phone_no = phone_no;
          }
      
          // Create or update email field
          user.email = email || null;
      
          // Check if a file is uploaded
          if (req.file) {
            const profile = req.file.filename;
      
            // Check if user already has a profile image
            if (user.profileImage) {
              // User has a profile image, update it
              user.profileImage = profile;
              await user.save();
      
              // Update user profile image in eventFeedModel
              await eventFeedModel.updateMany({ userId: id }, { $set: { user_profileImage: profile } });
      
              return res.status(200).json({
                success: true,
                message: 'Profile image and information updated successfully',
              });
            } else {
              // User does not have a profile image, create it
              user.profileImage = profile;
              await user.save();
      
              // Update user profile image in eventFeedModel
              const feed_user = await eventFeedModel.findOne({ userId: id });
              if (!feed_user) {
                return res.status(400).json({
                  success: false,
                  message: 'User not found in eventFeedModel',
                });
              }
              feed_user.user_profileImage = profile;
              await feed_user.save();
      
              return res.status(200).json({
                success: true,
                message: 'New profile image created and information updated successfully',
              });
            }
          } else {
            // No profile image provided, only update user information
            await user.save();
      
            return res.status(200).json({
              success: true,
              message: 'User information updated successfully',
            });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ success: false, message: 'Error while updating user profile' });
        }
      };
      
      
  // Api for get particular user details by there id
               const getUser = async( req ,res)=>{
                try {
                       const userId = req.params.userId
                      // check for userId
                  if(!userId)
                  {
                    return res.status(400).json({
                                   success : false ,
                                   userIdRequired : 'user id Required',

                    })
                  }

                  // check for user
                const user = await userModel.findOne({ _id : userId })
                if(!user)
                {
                  return res.status({
                                 success : false ,
                                 userExistanceMessage : 'user not found'
                  })
                }
                else
                {
                  return res.status(200).json({
                                  success : true ,
                                  message : 'user Details' ,
                                  user_details : user
                  })
                }
                } catch (error) {
                  return res.status(500).json({
                               success : false ,
                               serverErrorMessage : 'server Error'
                  })
                }
               }
      // APi for check number existance
      const numberExistance = async (req, res) => {
        try {
          const phone_no = req.body.phone_no;
          // check for phone_no existence
          const phone_exist = await userModel.findOne({ phone_no });
      
          if (!phone_exist) {
            return res.status(400).json({
              success: false,
              phone_no_required: 'Phone number does not exist in the user table',
            });
          } else {
            return res.status(200).json({
              success: true,             
              successMessage: 'phone number exists in the user table',
            });
          }
        } catch (error) {
          return res.status(500).json({
            success: false,
            serverError: 'Server error',
          });
        }
      };
      

    // user login
                    const userLogin = async(req,res)=>{                      
                        try {
                        const { phone_no } = req.body;
                    
                        // Find Admin by email
                        const user = await userModel.findOne({ phone_no });
                    
                        if (user) {
                            
                            return res.json({ message: 'user Login Successful', 
                                                 success: true,
                                                  data: {
                                                        _id : user._id,
                                                        fullName : user.fullName,
                                                        phone_no : user.phone_no ,
                                                        profileImage : user.profileImage
                                                  } });
                        } else {
                            return res.status(400).json({ message: 'phone_no not found', success: false });
                        }
                        } catch (error) {
                        console.error(error);
                        res.status(500).json({ message: 'Internal server error', success: false });
                        }
                    };

  
                   
                                              /*  Event management */


    // API for create Event
    const create_Event = async (req, res) => {
      try {
        const userId = req.params.userId;
        const {
          title,
          description,
          event_Type,
          venue_Date_and_time,
        } = req.body;
    
        const requiredFields = ['title', 'description', 'event_Type'];
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
          }
        }
    
        // check for user 
        const user = await userModel.findOne({ _id: userId });
        if (!user) {
          return res.status(400).json({ success: false, message: `User not found` });
        }
        const userName = user.fullName;
    
        const event = await eventModel.findOne({
          userId,
          title
      });
      
      if (event) {
          return res.status(400).json({
              success: false,
              eventExistanceMessage: 'Event already exists with the same userId and title'
          });
      }

        // Initialize venue_details as an empty array
        let venue_details = [];
    
        // If venue_Date_and_time is provided, process and set the details
        if (venue_Date_and_time) {
          if (venue_Date_and_time !== '') {
            venue_details = JSON.parse(venue_Date_and_time);
          }
        }
    
        // Process and store multiple image files
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            imagePaths.push(file.filename);
          });
        }
    
        const newEvent = new eventModel({
          title,
          description,
          event_Type,
          venue_Date_and_time: venue_details,
          Guests: [], 
          co_hosts: [], 
          images: imagePaths,
          userId: userId,
          userName: userName,
          event_status: eventModel.schema.path('event_status').getDefault(),
        });
    
        const saveEvent = await newEvent.save();
        const newAdminNotification = new AdminNotificationDetail({
          userId,
          userName: userName,
          message: `Congratulations..!! New event: ${saveEvent.title} has been created by the user: ${userName}`,
          date: new Date(),
        });
    
        await newAdminNotification.save();
        res.status(200).json({
          success: true,
          message: 'New Event created successfully',
          eventId: saveEvent._id
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: 'There is a server error'
        });
      }
    };
    
    
    
    
    
// API for add multiple event 
           
           const newVenue_Date_Time = async (req ,res) =>{
            const eventId = req.params.eventId
            const {sub_event_title ,venue_Name , venue_location, date , start_time , end_time} = req.body     
            try {
                        

                const event = await eventModel.findOne({ _id:eventId })
      
                if(!event)
                {
                    return res.status(400).json({ success : false , message : `event not found with the eventId ${eventId}`})
                }

                  //  newVenue_Date_Time is an array in the event model
              const duplicateVenue_Date_Time = event.venue_Date_and_time.find((venue) => venue.sub_event_title === sub_event_title);

              // if (duplicateVenue_Date_Time) {
              //   return res.status(400).json({ success: false, message: `venue '${venue_Name}' already exists in a event` });
              // }
                
              event.venue_Date_and_time.push({
                sub_event_title,
                venue_Name, 
                venue_location,                               
                date:date,
                start_time,
                end_time

            })
            await event.save()
            return res.status(200).json({ 
                                  success : true , 
                                message : `sub event added successfully`})
            } catch (error) {
                return res.status(500).json({
                    success : false ,
                    message : ' there is an server error'
                })
            }
           }

// add co host
                                const add_co_host = async (req, res) => {
                                  const eventId = req.params.eventId;
                                  const { co_host_Name, phone_no } = req.body;
                                  try {
                                      const requiredFields = ['co_host_Name', 'phone_no'];

                                      for (const field of requiredFields) {
                                          if (!req.body[field]) {
                                              return res.status(400).json({
                                                  message: `Missing ${field.replace('_', ' ')} field`,
                                                  success: false
                                              });
                                          }
                                      }

                                      // check for event
                                      const event = await eventModel.findOne({ _id: eventId });
                                      if (!event) {
                                          return res.status(400).json({
                                              success: false,
                                              eventExistanceMessage: 'Event not found with the given eventId'
                                          });
                                      }

                                      // Check if the phone number already exists among co-hosts
                                      const existPhoneNumber = event.co_hosts.find((cohost) => cohost.phone_no === phone_no);
                                      if (existPhoneNumber) {
                                          return res.status(400).json({
                                              message: `Co-host with the phone number ${phone_no} already exists`,
                                              success: false
                                          });
                                      }

                                      // Add co-host to the event
                                      event.co_hosts.push({
                                          co_host_Name,
                                          phone_no
                                      });

                                      await event.save();
                                      return res.status(200).json({
                                          success: true,
                                          message: `Co-host added successfully`
                                      });
                                  } catch (error) {
                                      console.error(error);
                                      return res.status(500).json({
                                          success: false,
                                          message: 'There is a server error'
                                      });
                                  }
                                };

// API for delete co-host in event
                             const delete_co_Host = async (req , res)=>{
                              
                                try {
                                  const eventId = req.params.eventId
                                  const co_hostId = req.params.co_hostId

                                  // check for event 
                                  const event = await eventModel.findOne({ _id : eventId })
                                  if(!event)
                                  {
                                    return res.status(400).json({
                                                     success : false ,
                                                      message : `event  not found`
                                    })
                                  }                                   
                                                                      
                                        // check for co-host existance
                                    const exist_co_hostIndex = event.co_hosts.findIndex(co_host => co_host._id.toString() === co_hostId)
                                    if(exist_co_hostIndex === -1)
                                    {
                                      return res.status(400).json({ 
                                                                success : false ,
                                                                message : `co_host not found`
                                      })
                                    }


                                  // remove the co-host from the co_host array
                                  event.co_hosts.splice(exist_co_hostIndex , 1)

                                  await eventModel.findByIdAndUpdate(
                                    { _id : eventId },
                                    { co_hosts : event.co_hosts}
                                  )

                                  res.status(200).json({
                                    success : true,
                                    message : `co-host deleted successfully`
                                    })

                                } catch (error) {
                                  return res.status(500).json({
                                                            success : false ,
                                                            message : 'there is an server error'
                                  })
                                }
                              }
      
            // APi for get co-host  of event
                             
            const getAll_co_Hosts = async (req, res) => {
              try {
                const eventId = req.params.eventId;
            
                // Check for event existence
                const event = await eventModel.findOne({ _id: eventId });
            
                if (!event) {
                  return res.status(404).json({
                    success: false,
                    message: 'Event not found',
                  });
                }
            
                const co_Hosts = event.co_hosts;
            
                res.status(200).json({
                  success: true,
                  message: 'All coHosts in the event',
                  co_hostsData: co_Hosts,
                });
              } catch (error) {
                
                res.status(500).json({
                  success: false,
                  message: 'There is a server error',
                });
              }
            };

 
// API for edit Venue_Date_Time 
                    const edit_Venue_Date_Time = async (req ,res)=>{
                      let eventId;
                      try {
                          const venueId = req.params.venueId;
                          eventId = req.params.eventId;
                          // check for subEventId
                          if(!venueId)
                          {
                            return res.status(400).json({
                                             success : false ,
                                             subEventIdRequired : 'Sub event ID required'
                            })
                          }
                        // check for eventId 
                        if(!eventId)
                        {
                          return res.status(400).json({
                                           success : false ,
                                           eventIdRequired : 'event Id required'
                          })
                        }
                          const {sub_event_title , venue_Name , venue_location, date , start_time , end_time} = req.body
                          // Check for event existence
                          const existEvent = await eventModel.findOne({ _id: eventId });
                          if (!existEvent) {
                              return res.status(404).json({ success: false, message: "event not found" });
                          }
                              // Check if the venue_Date_and_time array exists within event

                                if(!existEvent.venue_Date_and_time || !Array.isArray(existEvent.venue_Date_and_time))
                                {
                                  return res.status(400).json({ success : false ,
                                                                message : "venue date and time array not found in the route"})
                                }

                              // Check for venueIndex
                          const existVenueIndex = existEvent.venue_Date_and_time.findIndex(
                              (venue) => venue._id.toString() === venueId
                          );
                          if (existVenueIndex === -1) {
                              return res.status(404).json({ success: false, message: "sub Event not found" });
                          }
                            
                              // Update the properties of the venue
                            existEvent.venue_Date_and_time[existVenueIndex].sub_event_title = sub_event_title
                            existEvent.venue_Date_and_time[existVenueIndex].venue_Name = venue_Name
                            existEvent.venue_Date_and_time[existVenueIndex].venue_location = venue_location
                            existEvent.venue_Date_and_time[existVenueIndex].date = date
                            existEvent.venue_Date_and_time[existVenueIndex].start_time = start_time
                            existEvent.venue_Date_and_time[existVenueIndex].end_time = end_time
                            
                              // Save the updated event back to the database
                              await existEvent.save()
                              return res.status(200).json({
                                                          success : true ,
                                                          message : `SubEvent edited successfully `
                              })                          
                                  } catch (error) {
                                    
                                      return res.status(500).json({
                                          success : false ,
                                          message : ' server error'
                                      })
                                  }
                                }

// API for delete venue in a Event
                              const delete_Venue_Date_Time = async (req ,res)=>{
                                  
                                  try {
                                        const venueId = req.params.venueId
                                        const eventId = req.params.eventId
                                            // check for event existance
                                        const event = await eventModel.findById(eventId)
                                        if(!event)
                                        {
                                          res.status(400).json({
                                                        success : false,
                                                        message : 'event not found'
                                          })
                                        }                                                    
                                     
                                        // check for venue existance
                                    const existVenueIndex = event.venue_Date_and_time.findIndex(venue => venue._id.toString() === venueId)
                                    if(existVenueIndex === -1)
                                    {
                                      return res.status(400).json({
                                                             success : false ,
                                                             message : "SubEvent not found "
                                      })
                                    }
                                  // remove the venue from the venue_Date_and_Time array
                                  event.venue_Date_and_time.splice(existVenueIndex, 1)

                                    await eventModel.findByIdAndUpdate(
                                          { _id:eventId },
                                          {venue_Date_and_time : event.venue_Date_and_time}
                                    )

                                    res.status(200).json({
                                                      success : true,
                                                      message : `SubEvent deleted successfully`
                                    })


                                  } catch (error) {
                                      return res.status(500).json({
                                          success : false,
                                          message : 'there is a server error'
                                      })
                                  }
                              }

// add guest in event
                            const add_guest = async (req, res) => {
                              try {
                                  const eventId = req.params.eventId;
                                  const { Guest_Name, phone_no } = req.body;                                        

                                  const requiredFields = ['Guest_Name', 'phone_no'];

                                  for (const field of requiredFields) {
                                      if (!req.body[field]) {
                                          return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                      }
                                  }

                                  // Check for event
                                  const event = await eventModel.findOne({ _id: eventId });

                                  if (!event) {
                                      return res.status(400).json({ success: false, message: `Event not found with the eventId ${eventId}` });
                                  }

                                  // Check if guest already exists with the same phone_no
                                  const guestExist = event.Guests.find((guest) => guest.phone_no === phone_no);

                                  if (guestExist) {
                                      return res.status(400).json({
                                          success: false,
                                          guestExistMessage: 'Guest already exists with the same phone_no',
                                      });
                                  }
                                    else
                                    {
                                  // Add the new guest to the Guests array
                                  event.Guests.push({
                                      Guest_Name,
                                      phone_no,
                                      status: 0,
                                  });
                                      
                                  await event.save();

                                  return res.status(200).json({
                                      success: true,
                                      message: `Guest added successfully`,
                                  });
                                }
                              } catch (error) {
                                  console.error(error);
                                  return res.status(500).json({
                                      success: false,
                                      message: 'There is a server error',
                                  });
                              }
                            };

   

      // API for import guest from excel
                          const import_Guest = async (req, res) => {
                            try {
                              const eventId = req.params.eventId;
                          
                              // Check for event existence
                              const event = await eventModel.findOne({ _id: eventId });
                          
                              if (!event) {
                                return res.status(400).json({
                                  success: false,
                                  message: 'Event not found',
                                });
                              }
                          
                              const workbook = new ExcelJs.Workbook();
                              await workbook.xlsx.readFile(req.file.path);
                              const worksheet = workbook.getWorksheet(1);
                              const guestData = {};
                          
                              worksheet.eachRow((row, rowNumber) => {
                                if (rowNumber !== 1) {
                                  // Skip the header row
                                  const phone_no = row.getCell(2).value;
                                  const rowData = {
                                    Guest_Name: row.getCell(1).value,
                                    phone_no: phone_no,
                                  };
                                  // Check if the phone_no already exists in the event's Guests array
                                  if (!event.Guests.some((guest) => guest.phone_no === phone_no)) {
                                    guestData[phone_no] = rowData;
                                  }
                                }
                              });
                          
                              const uniqueGuestData = Object.values(guestData);
                          
                              if (uniqueGuestData.length > 0) {
                                // Use the $addToSet operator to add only unique phone numbers to the event
                                await eventModel.updateOne(
                                  { _id: eventId },
                                  { $addToSet: { 'Guests': { $each: uniqueGuestData } } }
                                );
                          
                                res.status(200).json({
                                  success: true,
                                  message: 'Guest data imported successfully',
                                });
                              } else {
                                res.status(200).json({
                                  success: true,
                                  message: 'No new guest data to import',
                                });
                              }
                            } catch (error) {
                              console.error(error);
                              return res.status(500).json({
                                success: false,
                                message: 'There is a server error',
                              });
                            }
                          };
      
      
        // APi for get all Guests in event
                    const getAllGuest = async (req, res) => {
                      try {
                        const eventId = req.params.eventId;
                    
                        // Check for event existence
                        const event = await eventModel.findOne({ _id: eventId });
                    
                        if (!event) {
                          return res.status(404).json({
                            success: false,
                            message: 'Event not found',
                          });
                        }
                    
                        const guest = event.Guests;
                    
                        res.status(200).json({
                          success: true,
                          message: 'All guests in the event',
                          guest_data: guest,
                        });
                      } catch (error) {
                        
                        res.status(500).json({
                          success: false,
                          message: 'There is a server error',
                        });
                      }
                    };

                                                              
   // Api for delete Guests in event
                      const delete_Guest = async (req , res)=>{
                                                  
                        try {
                          const eventId = req.params.eventId
                          const guestId = req.params.guestId

                          // check for event 
                          const event = await eventModel.findOne({ _id : eventId })
                          if(!event)
                          {
                            return res.status(400).json({
                                            success : false ,
                                              message : `event : ${eventId} not found`
                            })
                          }                                   
                                                              
                                // check for Guest existance
                            const exist_guestIndex = event.Guests.findIndex(guest => guest._id.toString() === guestId)
                            if(exist_guestIndex === -1)
                            {
                              return res.status(400).json({ 
                                                        success : false ,
                                                        message : `guest not found`
                              })
                            }


                          // remove the guest from the Guests array
                          event.Guests.splice(exist_guestIndex , 1)

                          await eventModel.findByIdAndUpdate(
                            { _id : eventId },
                            { Guests : event.Guests}
                          )

                          res.status(200).json({
                            success : true,
                            message : `Guest deleted successfully`
                            })

                        } catch (error) {
                          return res.status(500).json({
                                                    success : false ,
                                                    message : 'there is an server error'
                          })
                        }
                      }        
                                     
  // API to add all guest as favourite in bookmark 
                  const addAllGuestsToBookmark = async (req, res) => {
                    try {
                      const eventId = req.params.eventId;
                      const collectionName = req.body.collectionName;
                  
                      // Validate collectionName as a required field
                      if (!collectionName) {
                        return res.status(400).json({
                          success: false,
                          message: 'collectionName is a required field',
                        });
                      }
                  
                      // Check if collectionName already exists in bookmark table
                      const existingCollection = await bookmarkModel.findOne({
                        eventId : eventId,
                        'bookmark_Collection.name': collectionName,
                      });
                  
                      let updatedCollection;
                  
                      if (!existingCollection) {
                        // If collectionName does not exist in bookmark table, create a new collection
                        const newCollection = new bookmarkModel({
                          eventId : eventId ,
                          bookmark_Collection: [{ name: collectionName, bookmark_entries: [] }],
                        });
                  
                        // Check event existence
                        const event = await eventModel.findOne({ _id: eventId });
                        if (!event) {
                          return res.status(400).json({
                            success: false,
                            message: 'No event found',
                          });
                        }
                  
                        // Get all unique guests in the event
                        const uniqueGuests = Array.from(
                          new Set(event.Guests.map((guest) => guest._id.toString()))
                        ).map((guestId) =>
                          event.Guests.find((guest) => guest._id.toString() === guestId)
                        );
                  
                        // Set the entries array directly with uniqueGuests values
                        newCollection.bookmark_Collection[0].bookmark_entries = uniqueGuests.map((guest) => ({
                          Guest_Name: guest.Guest_Name,
                          phone_no: guest.phone_no,
                          status: 1,
                        }));
                  
                        // Save the new collection entry
                        updatedCollection = await newCollection.save();
                      } else {
                        // Check event existence
                        const event = await eventModel.findOne({ _id: eventId });
                        if (!event) {
                          return res.status(400).json({
                            success: false,
                            message: 'No event found',
                          });
                        }                  
                        // Get all unique guests in the event
                        const uniqueGuests = Array.from(
                          new Set(event.Guests.map((guest) => guest._id.toString()))
                        ).map((guestId) =>
                          event.Guests.find((guest) => guest._id.toString() === guestId)
                        );                  
                        // Update the bookmark with unique bookmark_entries using $addToSet
                        await bookmarkModel.updateOne(
                          { 'eventId': eventId , 'bookmark_Collection.name': collectionName },
                          {
                            $addToSet: {
                              'bookmark_Collection.$.bookmark_entries': {
                                $each: uniqueGuests.map((guest) => ({
                                  Guest_Name: guest.Guest_Name,
                                  phone_no: guest.phone_no,
                                  status: 1,
                                })),
                              },
                            },
                          }
                        );
                  
                        // Fetch the updated collection
                        updatedCollection = await bookmarkModel.findOne({
                          'eventId' : eventId,
                          'bookmark_Collection.name': collectionName,
                        });
                      }
                  
                      res.status(200).json({
                        success: true,
                        message: 'All guests added to bookmark as favorites',
                        eventId : eventId,
                        collection_details: updatedCollection.bookmark_Collection.find(
                          (collection) => collection.name === collectionName
                        ),
                      });
                    } catch (error) {
                      console.error(error);
                      return res.status(500).json({
                        success: false,
                        message: 'There is a server error',
                      });
                    }
                  };
                  
                  
          // delete a particular guest in a collection in bookMark model
          const deleteGuestInCollection = async (req, res) => {
            try {
             
              const collection_id = req.params.collection_id;
              const guestId = req.params.guestId;
              // Check for the presence of collection_id
              if (!collection_id) {
                return res.status(400).json({
                  success: false,
                  message: 'Please provide a collection_id',
                });
              }
          
              // Find the collection with the specified name
              const collection = await bookmarkModel.findOne({
                _id : collection_id
              });
          
              // Check if the collection exists
              if (!collection) {
                return res.status(400).json({
                  success: false,
                  message: `Collection not found`,
                });
              }
          
              // Find the index of the guest in the bookmark_entries array
              const guestIndex = collection.bookmark_Collection[0].bookmark_entries.findIndex(
                (entry) => entry._id.toString() === guestId
              );
          
              // Check if the guest exists in the collection
              if (guestIndex === -1) {
                return res.status(400).json({
                  success: false,
                  message: `Guest not found in collection`,
                });
              }
          
              // Remove the guest from the bookmark_entries array
              collection.bookmark_Collection[0].bookmark_entries.splice(guestIndex, 1);
          
              // Save the updated collection
              await collection.save();
          
              res.status(200).json({
                success: true,
                message: `Guest deleted successfully from collection`,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: 'There is a server error',
              });
            }
          };
          
      // get an particular event
                                 const searchEvent = async (req , res)=>{
                                  try {
                                       const event_Type = req.body.event_Type                                     

                                       // check for event existnace
                                       const event = await eventModel.find({ event_Type : event_Type })
                                       if(!event)
                                       {
                                        return res.status(400).json({
                                                                  success : false ,
                                                                  message : `Event not found `
                                        })
                                       }
                                       else
                                       {
                                        return res.status(200).json({
                                                                   success : true,
                                                                   message : `Event Details`,
                                                                   event_details : event
                                        })
                                       } 
                                       
                                      
                                  } catch (error) {
                                    return res.status(500).json({
                                                       success : false,
                                                       message : ' there is an server error '
                                    })
                                  }
                                 }
                
            // API for get filtered Event 
                                        const getFilteredEvent = async (req, res) => {
                                          try {
                                            const {
                                              latest_Update,
                                              date,
                                              venue_location,
                                              event_Type,
                                              title,
                                              
                                            } = req.query;
                                        
                                            const filter = {};
                                        
                                                    if (latest_Update) 
                                                    {
                                                      filter.updatedAt = {
                                                        $gte: new Date(latest_Update),
                                                      };
                                                    }   
                                                    if(event_Type)
                                                    {
                                                      filter.event_Type = event_Type
                                                    }

                                                    if(title)
                                                    {
                                                      filter.title = title
                                                    }
                                                    
                                                    if(venue_location)
                                                    {
                                                      filter['venue_Date_and_time.venue_location'] = venue_location
                                                    }

                                                     if (date) {
                                                    filter['venue_Date_and_time.date'] = date
                                                    } 
                                                       
                                                    



                                            const events = await eventModel.find(filter);
                                        
                                            return res.status(200).json({
                                              success: true,
                                              message: 'Filtered events',
                                              events: events,
                                            });
                                          } catch (error) {
                                            return res.status(500).json({
                                              success: false,
                                              message: 'There is a server error',
                                            });
                                          }
                                        };
                // API for delete an event
                const deleteEvent = async (req , res)=>{
                  try {
                               const eventId = req.params.eventId
                               // check for event
                          const event = await eventModel.findByIdAndDelete({_id : eventId })
                          if(!event)
                          {
                            return res.status(400).json({
                                                  success : false ,
                                                  message :  `Event not found with the given eventId`
                            })
                          }
                          else
                          {
                            return res.status(200).json({
                                                      success : true ,
                                                      message : `event deleted successfully`
                            })
                          }
                  } catch (error) {
                    return res.status(500).json({
                                          success : false ,
                                          message : 'there is an server error'
                    })
                  }
                }                        
            // APi for give feedback
                             const feedback = async (req ,res)=>{
                              try {
                                    const {userId , eventId } = req.params
                                    const { rating , message , feedback_Type } = req.body                                    

                                    const requiredFields = [
                                      'rating' ,
                                      'message' ,
                                      'feedback_Type'                        
                                  ];
                                   for (const field of requiredFields) {
                                      if (!req.body[field]) {
                                          return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                      }
                                  }
                                          //check for user
                                    const user = await userModel.findOne({ _id : userId})
                                    if(!user)
                                    {
                                      return res.status(400).json({
                                                       success : false ,
                                                       userExistanceMessage  : 'no user found'
                                      })
                                    }

                                    const userName = user.fullName
                                      // check for event existance
                                      const event = await eventModel.findOne({ _id : eventId })
                                      if(!event)
                                      {
                                        return res.status(400).json({
                                                                   success : false ,
                                                                    message : 'event not found'
                                        })
                                      }

                                         // check if rating is within the range of 1 to 5
                                         if(rating < 1 || rating > 5)
                                         {
                                          return res.status(400).json({
                                                                  success : false ,
                                                                  message : 'Rating should be in Range of 1 to 5 '
                                          })
                                         }

                                    const feedbacks = new feedbackModel({
                                      rating ,
                                      message,
                                      feedback_Type,
                                      eventId : eventId ,
                                      userId : userId ,
                                      userName : userName

                                    })
                              
                                    await feedbacks.save()
                                     return res.status(200).json({
                                                                success : true ,
                                                                message : ' feedback saved successfully',
                                                                feedback_details : feedbacks
                                     })
                              } catch (error) {
                                console.error(error);
                                return res.status(500).json({
                                                       success : false ,
                                                       message : ' there is an server error '
                                })
                              }
                             }
          // APi for delete user
                                     const deleteUser = async (req ,res)=>{
                                      try {
                                        const userId = req.params.userId
                                                  // check for user and delete 
                                        const user = await userModel.findOneAndDelete({ _id : userId })
                                        if(!user)
                                        {
                                          return res.status(400).json({ 
                                                                      success : false ,
                                                                      message : 'User not found'
                                          })
                                        }
                                        else
                                        {
                                          return res.status(200).json({
                                                                    success : true ,
                                                                    message : 'User deleted successfully'
                                          })
                                        }
                                            
                                      } catch (error) {
                                        return res.status(500).json({
                                                                success : false ,
                                                                message : 'there is an server error'
                                        })
                                      }
                                     }
        // APi for get Event Images
                              const getImages = async (req ,res)=>{
                                try {
                                      const eventId = req.params.eventId
                                      // check for event
                                  const event = await eventModel.findOne({ _id : eventId })
                                  if(!event)
                                  {
                                    return res.status(400).json({
                                                            success : false ,
                                                            message : 'event not found'
                                    })
                                  }
                                  
                                  const eventImages = event.images                                 
                                    return res.status(200).json({
                                                          success : true ,
                                                          message : 'event images ',
                                                          eventImages : eventImages
                                    })

                                } catch (error) {
                                  return res.status(500).json({
                                                          success : false ,
                                                          message : 'there is an server error'
                                  })
                                }
                              }
         
 // APi for get all events
                        
                const getAllEvents = async (req, res) => {
                  try {
                    const events = await eventModel.find({});
                    if (events.length === 0) {
                      return res.status(400).json({
                        success: false,
                        message: 'There are no events found',
                      });
                    }
                    const sorted_Event = events.sort(
                      (a, b) => b.createdAt - a.createdAt
                    );
                    res.status(200).json({
                      success: true,
                      message: 'All Events',
                      events_data: sorted_Event,
                    });
                  } catch (error) {
                    return res.status(500).json({
                      success: false,
                      message: 'There is a server error',
                    });
                  }
                };
    
    // API for get user event 
                  const getUserEvent = async(req ,res)=>{
                    try {
                      const userId = req.params.userId
                      // check for user
                      const user = await userModel.findOne({ _id : userId })
                      if(!user)
                      {
                        return res.status(400).json({
                                          success : false ,
                                          message : 'user not found'
                        })
                      }
                      // check for user event
                      const event = await eventModel.find({ userId : userId })
                      if(!event)
                      {
                        return res.status(400).json({
                                          success : false ,
                                          message : 'user event not found'
                        })
                      }
                      else
                      {
                        // Sort user Event by createdAt
                        const sorted_userEvent = event.sort(
                          (a, b) => b.createdAt - a.createdAt
                        );

                        return res.status(200).json({
                                       success : true ,
                                       message : 'user events',
                                       events : sorted_userEvent
                        })
                      }

                    } catch (error) {
                      return res.status(500).json({
                                  success : false ,
                                  message : 'there is a server error '
                      })
                    }
                  }

                              /*  Contact Us */
  // API for contact us
                    const contactUsPage = async(req , res) =>{
                      try {
                            const {userName , user_Email , user_phone , message } = req.body
                          
                            const requiredFields = ['userName', 'user_Email' , 'user_phone' , 'message'];
                            for (const field of requiredFields)
                             {
                                if (!req.body[field])
                                 {
                                    return res.status(400).json({
                                        success: false,
                                        message: `Missing ${field.replace('_', ' ')} field`,
                                    });
                                 }
                            }
                            const newData = new contactUs({
                              userName,
                              user_Email,
                              user_phone,
                              message,                        
                             
                          });
                               await newData.save()
                            return res.status(200).json({
                                              success : true ,
                                              successMessage :'contact Us Data',
                                              contactUs_Data : newData
                            })
                      } catch (error) {
                        console.error(error);
                        return res.status(500).json({
                                     success : false ,
                                     serverErrorMessage : 'server Error'
                        })
                      }
                    }

        // API for FAQ 
                      const faqPage = async(req ,res)=>{
                        try {
                               const { userName , user_Email , user_phone  , message } = req.body
                               const requiredFields = ['userName', 'user_Email' , 'user_phone' ,  'message'];
                               for (const field of requiredFields)
                                {
                                   if (!req.body[field])
                                    {
                                       return res.status(400).json({
                                           success: false,
                                           message: `Missing ${field.replace('_', ' ')} field`,
                                       });
                                    }
                               }
                               
                            const newFaqData = new faqModel({
                              userName,
                              user_Email,
                              user_phone,                             
                              message
                            })
                            await newFaqData.save()

                            return res.status(200).json({
                                              success : true ,
                                              successMessage : 'new Faq data inserted successfully ...!' ,
                                              faq_Details : newFaqData
                            })
                        } catch (error) {
                          return res.status(500).json({
                                          success : false ,
                                          serverErrorMessage : 'server Error'
                          })
                        }
                      }         
  
         // APi for send Invitation to event Guests            
         const sendInvitation = async (req, res) => {
          try {
              const { eventId } = req.params;
      
              // Find event
              const event = await eventModel.findOne({ _id: eventId }).populate('Guests');
              if (!event) {
                  return res.status(400).json({
                      success: false,
                      eventExistanceMessage: 'Event not found',
                  });
              }
             
          // Check for bus number
          const existInvitedEvent = await InvitedeventModel.findOne({ eventId });
  
          if (existInvitedEvent) {
              return res.status(400).json({ success : true , message: 'you already invite Guests for these event ' });
          }
              // Create invitations object
              const invitation = {
                  hostId: event.userId,
                  eventId: eventId,
                  hostName: event.userName,
                  event_title: event.title,
                  event_description: event.description,
                  event_Type: event.event_Type,
                  co_hosts: event.co_hosts,
                  Guests: event.Guests,
                  images: event.images,
                  event_status: event.event_status,
                  venue_Date_and_time: event.venue_Date_and_time,
                  event_status: InvitedeventModel.schema.path('event_status').getDefault(),
              };
      
              // Populate Guests array with default status
              invitation.Guests = event.Guests.map(guest => ({
                  Guest_Name: guest.Guest_Name,
                  phone_no: guest.phone_no,
                  status: 2, // Default status: 2 (pending)
              }));
      
              // Save invitation to the database
              await InvitedeventModel.create(invitation);
      
              for (const guest of event.Guests) {
                  // Convert the phone number string to numeric format
                  const phone_no_numeric = parseInt(guest.phone_no, 10);
                  const formattedPhoneNumber = `+91${phone_no_numeric}`;
                  const  message = `Hello, you are invited to ${event.title} by ${event.userName}. Receive updates about the event on the link: https://localhost.com`;
                 
      
                  // Use SMS Gateway Hub to send SMS
                  await sendSMSUsingGatewayHub(formattedPhoneNumber, message);
              }
      
              res.status(200).json({
                  success: true,
                  successMessage: 'Invitation for the event stored successfully, and SMS sent to guests!',
              });
          } catch (error) {
              console.error('Error:', error.response ? error.response.data : error.message);
              res.status(500).json({
                  success: false,
                  serverErrorMessage: 'SERVER ERROR',
              });
          }
      };
      
      const sendSMSUsingGatewayHub = async (formattedPhoneNumber, message, apiKey = 'DfRvyBzYh02aalLlL4j9Zg', senderId = 'FESSMS') => {
        const gatewayHubApiUrl = 'https://www.smsgatewayhub.com/api/mt/SendSMS';
    
        try {
            // const encodedMessage = encodeURIComponent(message);
    
            const response = await axios.get(gatewayHubApiUrl, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    APIKey: apiKey,
                    senderid: senderId,
                    channel: 2,
                    DCS: 0,
                    flashsms: 0,
                    number: formattedPhoneNumber,
                    text: message,
                    route: 31,
                    EntityId: '1111111111111111111',
                    dlttemplateid: '1111111111111111111',
                    TelemarketerId: 123,
                },
            });
    
            console.log('SMS sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending SMS:', error.response ? error.response.data : error.message);
            throw error;
        }
    };             
    


           
  
  // API for get InvitedEvent of user
                        const getMyInvitation = async (req, res) => {
                          try {
                            const { phone_no } = req.body;

                            if(!phone_no)
                            {
                              return res.status(400).json({
                                       success : false ,
                                       phone_n0_required : 'phone number Required'
                              })
                            }
                           
                            // check for user via phone_no
                            const user = await userModel.findOne({ phone_no: phone_no });
                        
                            if (!user) {
                              return res.status(400).json({
                                success: false,
                                userExistanceMessage: 'user not registerd yet with these number',
                              });
                            }
                        
                            // check if user is a guest in any Invited event
                            const invitedEvents = await InvitedeventModel.find({
                              'Guests.phone_no': phone_no,
                             
                            });
                        
                            if (invitedEvents.length === 0) {
                              return res.status(400).json({
                                success: false,
                                userInvitedMessage: 'user not invited to any event',
                              });
                            }
                        
                            // Extract event details excluding the Guests array for the first event
                            const eventsDetails =  invitedEvents.map(event => {
                              return {
                                ...event.toObject(),
                                Guests: undefined,
                              };
                            });
                            const sortedeventsDetails = eventsDetails.sort(
                              (a, b) => b.createdAt - a.createdAt
                            );
                            return res.status(200).json({
                              success: true,
                              sortedeventsDetails ,
                              

                            });
                            
                          } catch (error) {
                            console.error(error);
                            return res.status(500).json({
                              success: false,
                              serverErrorMessage: 'Server Error',
                            });
                          }
                        };
  
        // APi for update events
        const updateEvent = async (req, res) => {
          try {
            const eventId = req.params.eventId;
            const {
              title,
              description,
              event_Type,
              sub_event_title,
              venue_Name,
              venue_location,
              date,
              start_time,
              end_time,
              images,
              venue_Date_and_time,
            } = req.body;
        
            // Convert event_key to number if it's a string
            let event_key = req.body.event_key;
        
            if (typeof event_key === 'string') {
              event_key = parseInt(event_key);
            }
        
            // Check for event existence
            const existingEvent = await eventModel.findOne({ _id: eventId });
            if (!existingEvent) {
              return res.status(400).json({
                success: false,
                eventExistanceMessage: 'Event does not exist',
              });
            }
               // Check if req.files exist and if it contains images
         if (req.files && req.files.length > 0) {
             const images = [];
  
        for (const file of req.files) {
          // Ensure that the file is an image
          if (file.mimetype.startsWith('image/')) {
            // If the Event Images already exist, delete the old file if it exists
            if (existingEvent.images && existingEvent.images.length > 0) {
              existingEvent.images.forEach(oldFileName => {
                const oldFilePath = `uploads/${oldFileName}`;
                if (fs.existsSync(oldFilePath)) {
                  fs.unlinkSync(oldFilePath);
                }
              });
            }
            // Add the new image filename to the images array
            images.push(file.filename);
          }
        }
  
        // Update the images with the new one(s) or create a new one if it doesn't exist
        existingEvent.images = images.length > 0 ? images : undefined;
      }
            // Update event details
            if (title) {
              existingEvent.title = title;
            }
            if (description) {
              existingEvent.description = description;
            }
            if (event_Type) {
              existingEvent.event_Type = event_Type;
            }
            existingEvent.event_key = event_key
            await existingEvent.save();
            if (event_key === 1) {
              
              const venueArrayLength = existingEvent.venue_Date_and_time.length;
        
              if (venueArrayLength === 1) {
                // Update the existing venue details
                const existingVenue = existingEvent.venue_Date_and_time[0];
                existingVenue.sub_event_title = sub_event_title;
                existingVenue.venue_Name = venue_Name;
                existingVenue.venue_location = venue_location;
                existingVenue.date = date;
                existingVenue.start_time = start_time;
                existingVenue.end_time = end_time;
              } else if (venueArrayLength === 0) {
                // Add a new venue
                    if(!venue_Name || !venue_location || !date ||!start_time || !end_time )
                {
                            
                 
                  return res.status(200).json({
                                 success : true ,
                                 successMessage: 'Event updated successfully'
                  })
                }
                else
                {
                  
                }
                existingEvent.venue_Date_and_time.push({
                  sub_event_title,
                  venue_Name,
                  venue_location,
                  date,
                  start_time,
                  end_time,
                });
              } else {
                // Handle the case where venueArrayLength is greater than 1 (which should not happen)
                return res.status(400).json({
                  success: false,
                  errorMessage: 'Invalid venueArrayLength for event_key 1',
                });
              }
              existingEvent.event_key = event_key
              // Save the updated event back to the database
              await existingEvent.save();
            } 

            else if (event_key === 2) {
              // Initialize venue_details as an empty array
              let venue_details = [];
               
              // If venue_Date_and_time is provided, process and set the details
              if (venue_Date_and_time) {
                if (venue_Date_and_time !== '') {
                  venue_details = JSON.parse(venue_Date_and_time);
                }
              }
              // Push multiple data at a time to venue_Date_and_time array
              existingEvent.venue_Date_and_time.push(...venue_details);
              existingEvent.event_key = event_key
              await existingEvent.save();
            } else {
              // Handle other event_key values if needed
            }
        
            return res.status(200).json({
              success: true,
              successMessage: 'Event updated successfully',
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({
              success: false,
              serverErrorMessage: 'Server Error',
            });
          }
        };
        
      
      
  // get event by Id
                          const getEvent = async(req , res) =>{
                            try {
                              const eventId = req.params.eventId;
                          
                              // Validate eventId (you may want to add more validation)
                              if (!eventId) {
                                return res.status(400).json({
                                  success: false,
                                  message: 'Invalid eventId',
                                });
                              }
                          
                              const event = await eventModel.findById(eventId);
                          
                              if (!event) {
                                return res.status(404).json({
                                  success: false,
                                  message: 'Event not found',
                                });
                              }
                          
                              res.status(200).json({
                                success: true,
                                message: 'Event found',
                                event_data: event,
                              });
                            } catch (error) {                              
                              return res.status(500).json({
                                success: false,
                                message: 'There is a server error',
                              });
                            }
                          };
  // APi for get all Envited Event

                           const getAllInvited_Event = async(req ,res)=>{
                            try {
                              const userId = req.params.userId
                              // check for userId
                              if(!userId)
                              {
                                return res.status(400).json({
                                              success : false ,
                                              userIdRequired : 'user Id required'
                                })
                              }

                                    const AllInvited_Events = await InvitedeventModel.find({ 
                                          hostId : userId

                                    })

                                    if(!AllInvited_Events)
                                    {
                                      return res.status(400).json({

                                               success : false ,
                                               eventExistanceMessage : 'there is no invited events here ..!'
                                      })
                                    }
                                          return res.status(200).json({
                                                       success : true ,
                                                        successMessage : 'all Invited Events' ,
                                                        all_Invited_Events : AllInvited_Events
                                          })
                                  } catch (error) {
                              return res.status(500).json({
                                             success : false ,
                                             serverErrorMessage : 'server Error'
                              })
                            }
                           }    
  // APi for get all subEvents  of events
                               const getVenuesOf_Event = async(req ,res)=>{
                                try {
                                       const eventId = req.params.eventId
                                       const event = await eventModel.findOne({ _id : eventId })
                                       if(!event)
                                       {
                                         return res.status(400).json({
                                                                 success : false ,
                                                                 message : 'event not found'
                                         })
                                       }
                                       
                                       const event_venues = event.venue_Date_and_time                                 
                                         return res.status(200).json({
                                                               success : true ,
                                                               message : 'Sub Events ',
                                                               eventId : eventId,
                                                               event_venues : event_venues
                                         })
                                } catch (error) {
                                  return res.status(500).json({
                                                 success : false ,
                                                 serverErrorMessage : 'server Error'
                                  })
                                }
                               }              
                           
// API for give response to Invited event on the behaf of user
                          const userRespondToInvitedEvent = async (req, res) => {
                            try {
                              const eventId = req.params.eventId;
                              const { response, event_title, selected_subEvent_Names, phone_no } = req.body;

                              // Check if the event exists
                              const invitedEvent = await InvitedeventModel.findOne({ eventId });

                              if (!invitedEvent) {
                                return res.status(400).json({
                                  success: false,
                                  eventMessage: 'Event not found',
                                });
                              }

                              // Now check if the user exists in userModel using the provided phone_no
                              const user = await userModel.findOne({ phone_no });

                              if (!user) {
                                return res.status(400).json({
                                  success: false,
                                  userExistanceMessage: 'User not found ',
                                });
                              }
                                  // Check if the user has already responded to the event
                                const userResponse = await userResponseEventModel.findOne({
                                  eventId:eventId ,
                                  'Guests.phone_no': user.phone_no,
                                });

                                if (userResponse) {
                                  return res.status(400).json({
                                    success: false,
                                    responseMessage: 'You already responded to the event',
                                  });
                                }
                              // Create a single response record for the entire event
                              const responseMapping = {
                                yes: 'accept',
                                no: 'reject',
                                maybe: 'undecided',
                                'yes-multiple': 'accept-all',
                                'some-multiple': 'accept-some',
                                'no-multiple': 'reject',
                              };

                              const venueStatus = responseMapping[response] === 'accept' || responseMapping[response] === 'some' ? 1 : responseMapping[response] === 'no' ? 2 : 0;

                              // Check if there is an existing record in userResponseEventModel for the same InvitedEventId
                              const existingUserResponse = await userResponseEventModel.findOne({
                                InvitedEventId: invitedEvent._id,
                              });

                              if (existingUserResponse) {
                                // Update the existing record
                                existingUserResponse.Guests.push({
                                  Guest_Name: user.fullName,
                                  phone_no: user.phone_no,
                                  guest_status: responseMapping[response] === 'accept' ? 0 : responseMapping[response] === 'reject' ? 1 : 0,
                                  venue: invitedEvent.venue_Date_and_time.length === 1 ? invitedEvent.venue_Date_and_time.map((venueDetails, index) => ({
                                    sub_event_title: venueDetails.sub_event_title,
                                    venue_status: venueStatus,
                                  })) : (selected_subEvent_Names && selected_subEvent_Names.length > 0) ? selected_subEvent_Names.map((sub_event_title, index) => ({
                                    sub_event_title: sub_event_title,
                                    venue_status: venueStatus,
                                  })) : [],
                                  eventId: eventId, 
                                });

                                // Update each sub_event_status based on the user's response
                                existingUserResponse.Guests.forEach(guest => {
                                  guest.venue.forEach(venue => {
                                    venue.venue_status = venueStatus;
                                  });
                                });

                                // Save the updated record
                                await existingUserResponse.save();
                              } else {
                                // Create a new record if it doesn't exist
                                const newUserResponse = new userResponseEventModel({
                                  hostId: invitedEvent.hostId,
                                  hostName: invitedEvent.hostName,
                                  InvitedEventId: invitedEvent._id, // Add the InvitedEventId
                                  eventId: eventId, // Add the eventId
                                  event_title: invitedEvent.venue_Date_and_time.length === 1 ? event_title : invitedEvent.event_title,
                                  event_description: invitedEvent.event_description,
                                  event_Type: invitedEvent.venue_Date_and_time.length === 1 ? 'single' : 'multiple',
                                  Guests: [
                                    {
                                      Guest_Name: user.fullName,
                                      phone_no: user.phone_no,
                                      guest_status: responseMapping[response] === 'accept' ? 0 : responseMapping[response] === 'reject' ? 1 : 0,
                                      venue: invitedEvent.venue_Date_and_time.length === 1 ? invitedEvent.venue_Date_and_time.map((venueDetails, index) => ({
                                        sub_event_title: venueDetails.sub_event_title,
                                        venue_status: venueStatus,
                                      })) : (selected_subEvent_Names && selected_subEvent_Names.length > 0) ? selected_subEvent_Names.map((sub_event_title, index) => ({
                                        sub_event_title: sub_event_title,
                                        venue_status: venueStatus,
                                      })) : [],
                                    },
                                  ],
                                  images: invitedEvent.images,
                                });

                                // Save the new record
                                await newUserResponse.save();
                              }

                              return res.status(200).json({
                                success: true,
                                responseMessage: 'Event response saved successfully',
                              });
                            } catch (error) {
                              console.error(error);
                              return res.status(500).json({
                                success: false,
                                serverErrorMessage: 'Server Error',
                              });
                            }
                          };


        // APi for get all Guests with there response for invitation
                            const getAllGuest_with_Response = async (req, res) => {
                              try {
                                const eventId = req.params.eventId;
                            
                                // Check if eventId is provided
                                if (!eventId) {
                                  return res.status(400).json({
                                    success: false,
                                    eventIdRequired: 'Event Id required',
                                  });
                                }
                            
                                // Check if the event exists in the event model
                                const event = await eventModel.findOne({ _id: eventId });
                            
                                if (!event) {
                                  return res.status(400).json({
                                    success: false,
                                    eventExistanceMessage: 'Event not found in event model',
                                  });
                                }
                            
                                // Check if the invitation event exists in the Invitation table
                                const invitationEvent = await InvitedeventModel.findOne({ eventId });
                            
                                if (!invitationEvent) {
                                  return res.status(400).json({
                                    success: false,
                                    InvitationEvent_ExistanceMessage: 'there is no invitation for the eventId',
                                  });
                                }
                            
                                // Check if there are guest responses for the invitation event
                                const guests_ResponseEvent = await userResponseEventModel.findOne({ eventId });
                            
                                if (!guests_ResponseEvent) {
                                  return res.status(400).json({
                                    success: false,
                                    guests_ResponseEvent: 'There is no guests response exist for the invitation',
                                  });
                                }
                            
                                // Extract the list of guests from the Guests array
                                const guestsList = guests_ResponseEvent.Guests;
                            
                                return res.status(200).json({
                                  success: true,
                                  successMessage: 'Invitation response guests Lists',
                                  guests_list: guestsList,
                                });
                              } catch (error) {
                                console.error(error);
                                return res.status(500).json({
                                  success: false,
                                  serverErrorMessage: 'Server Error',
                                });
                              }
                            };
                            
                    // Api for get response event
                  const getallResponseEvent = async ( req , res )=> {

                         try {                        
                          
                          const responseEvent = await userResponseEventModel.find({})
                          if(!responseEvent)
                          {
                            return res.status(400).json({
                                      success : false ,
                                      responseEventExistance : 'response event not found'
                            })
                          }
                          else
                          {
                            return res.status(200).json({
                                          success : true ,
                                          successMessage : 'Guests response event',
                                          guests_ResponseEvent : responseEvent

                            })
                          }
                         } catch (error) {
                           return res.status(500).json({
                                       success : false ,
                                       serverErrorMessage : 'server Error'
                           })
                         }
                  }

        // APi for get subEvent details of event 
        
        const getSubEventOf_Event = async(req ,res)=>{
          try {
                 const eventId = req.params.eventId
                 const subEventId = req.params.subEventId
                 const event = await eventModel.findOne({ _id : eventId })
                 if(!subEventId)
                 {
                   return res.status(400).json({
                                    success : false ,
                                    subEventIdRequired : 'Sub event ID required'
                   })
                 }
                  // Check if the venue_Date_and_time array exists within event

                  if(!event.venue_Date_and_time || !Array.isArray(event.venue_Date_and_time))
                  {
                    return res.status(400).json({ success : false ,
                                                  message : "date and time array not found in the Event"})
                  }

                // Check for venueIndex
            const existVenueIndex = event.venue_Date_and_time.findIndex(
                (venue) => venue._id.toString() === subEventId
            );
            if (existVenueIndex === -1) {
                return res.status(404).json({ success: false, message: "sub Event not found" });
            }
              else
              {   
                const subEventDetails = event.venue_Date_and_time[existVenueIndex];                              
                   return res.status(200).json({
                                         success : true ,
                                         message : 'Sub Events Details ',
                                         eventId : eventId,
                                         subEvent_Details : subEventDetails                                        
                   })
                  }
          } catch (error) {
            return res.status(500).json({
                           success : false ,
                           serverErrorMessage : 'server Error'
            })
          }
         }      
// APi for delete all Event 
         const deleteAllEvents = async (req, res) => {
          try {
            // Delete all events in the eventModel
            const result = await eventModel.deleteMany({});
        
            if (result.deletedCount === 0) {
              return res.status(400).json({
                success: false,
                message: 'No events found to delete',
              });
            }        
            res.status(200).json({
              success: true,
              message: 'All events deleted successfully',
              deletedCount: result.deletedCount,
            });
          } catch (error) {
            return res.status(500).json({
              success: false,
              message: 'There is a server error',
            });
          }
        };
        
  
  // Api for create event Album
  const createEventAlbum = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const albumName = req.body.albumName;

        if (!eventId) {
            return res.status(200).json({
                success: false,
                eventIdRequired: 'Event Id required fields',
            });
        }

        if (!albumName) {
            return res.status(200).json({
                success: false,
                albumNameRequired: 'albumName required fields',
            });
        }

        // Check for event existence
        const event = await eventModel.findOne({ _id: eventId });

        if (!event) {
            return res.status(200).json({
                success: false,
                eventExistanceMessage: 'Event not found',
            });
        }

        // Create a new album with the provided name
        const newAlbum = new eventImageModel({
            eventId: eventId,
            images: [{
                album_name: albumName,
                image_entries: [],
            }],
        });

        const createdAlbum = await newAlbum.save();

        return res.status(200).json({
            success: true,
            message: 'Album created successfully',
            eventId: event._id,
            album_name: createdAlbum.images[0].album_name,
            album_id: createdAlbum._id,
            createdAt: createdAlbum.createdAt,
            updatedAt: createdAlbum.updatedAt,
            __v: createdAlbum.__v,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'Server Error',
        });
    }
};
  
  
  // Api for get all Albums
  const getAllAlbum = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!eventId) {
            return res.status(200).json({
                success: false,
                eventIdRequired: 'Event Id required',
            });
        }

        // Check for event existence in event_Image_Model
        const event = await eventImageModel.findOne({ eventId });

        if (!event) {
            return res.status(200).json({
                success: false,
                message: 'Event not found ',
            });
        }

        // Fetch all Albums from the event_Image_Model
        const allAlbums = await eventImageModel.find({ eventId });

        if (!allAlbums || allAlbums.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No Album found',
            });
        } else {
            const albumsDetails = allAlbums.map(album => {
              
                return {
                    album_id: album._id,
                    album_name: album.images[0].album_name,
                    first_image: album.images[0].image_entries.length > 0
                    ? album.images[0].image_entries[0].image_path
                    : null
                };
            });

            res.status(200).json({
                success: true,
                message: 'All Albums with details',
                allAlbums: albumsDetails,
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverError: 'Server error',
        });
    }
};

  
  
  // get particular Album
  

  const getParticularAlbum = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const Album_Id = req.params.Album_Id;

        if (!eventId) {
            return res.status(200).json({
                success: false,
                eventIdRequired: 'Event Id Required',
            });
        }

        const event = await eventImageModel.findOne({ eventId });

        if (!event) {
            return res.status(200).json({
                success: false,
                message: 'event not found',
            });
        }

        if (!Album_Id) {
            return res.status(200).json({
                success: false,
                albumIdRequired: 'Album Id required',
            });
        }

        const album = await eventImageModel.findOne({ _id: Album_Id }, 'images');

        if (!album) {
            return res.status(200).json({
                success: false,
                message: 'Album not found',
            });
        } else {
            const {  _id: album_id, images } = album;
            const { _id: image_array_id, image_entries , album_name} = images[0];

            return res.status(200).json({
                success: true,
                message: 'Album Details',
                album_name,
                album_id,               
                image_entries,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'server Error',
        });
    }
};
          // Api for add Images in Album 
          const addImages_in_Album = async (req, res) => {
            try {     
                const album_id = req.params.album_id;
        
                // Check for album id
                if (!album_id) {
                    return res.status(200).json({
                        success: false,
                        albumIdRequired: 'Album Id Required',
                    });
                }
        
                // Check for album existence
                const album = await eventImageModel.findOne({ _id: album_id });
        
                if (!album) {
                    return res.status(200).json({
                        success: false,
                        message: 'Album not found',
                    });
                }
        // Add multiple images as objects with unique ids
        // const imageObjects = [];
        
        // if (req.files && req.files.length > 0) {
        //     req.files.forEach(file => {
        //         const imageObject = {
        //             image_path: file.filename,
        //         };
        //         imageObjects.push(imageObject);
        //     });
        // }

       
        // const defaultImageArray = album.images[0];

        // // Add image objects to image_entries array
        // defaultImageArray.image_entries.push(...imageObjects);


        // upload single 
        const imageObject = {
          image_path: req.file.filename, 
       };

      const defaultImageArray = album.images[0];

      // Add image object to image_entries array
      defaultImageArray.image_entries.push(imageObject);

        // Save the updated album
        await album.save();

        return res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            image_objects: imageObject,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'Server Error',
        });
    }
};

        
    // Api for rename Album
            const rename_album = async(req ,res)=>{
              try {
                      const album_id = req.params.album_id
                      const new_album_name = req.body.new_album_name
                    // check for albumId
                  if(!album_id)
                  {
                    return res.status(200).json({
                                 success : false ,
                                 message : 'album Id required'
                    })
                  }

              // check for album
              const album = await eventImageModel.findOne({ _id : album_id }, 'images')
              if(!album)
              {
                return res.status(200).json({
                            success : false ,
                            message : 'album not exist'
                })
              }
              album.images[0].album_name = new_album_name;
              await album.save();

              return res.status(200).json({
                       success : true ,
                       message : 'album Renamed Successfully'
              })
              } catch (error) {
                return res.status(500).json({
                           success : false ,
                           serverErrorMessage : 'server Error '
                })
              }
            }

            // Api for delete particular Album
                const deleteAlbum = async(req ,res)=>{
                  try {
                           const album_id = req.params.album_id
                        // check for album id
                        if(!album_id)
                        {
                          return res.status(200).json({
                                       success : false ,
                                       message : 'album Id Required'
                          })
                        }

                        // check for album
                        const album = await eventImageModel.findOneAndDelete({ _id : album_id })
                        if(!album)

                        {
                          return res.status(200).json({
                                      success : false ,
                                      message : 'album not exist'
                          })
                        }
                        else
                        {
                          return res.status(200).json({
                                           success : true,
                                           message : 'album deleted successfully'
                          })
                        }
                  } catch (error) {
                          return res.status(500).json({
                                       success : false ,
                                       serverErrorMessage : 'server Error'
                          })
                  }
                }

          // APi for delete particular image in album
                          const deleteImage = async(req ,res)=>{
                            try {
                                 const { image_id , album_id } = req.params
                                 //check required fields
                                 if(!image_id)
                                 {
                                  return res.status(200).json({
                                           success : false ,
                                           image_id_Required : 'image id required'
                                  })
                                 }
                                
                                 if(!album_id)
                                 {
                                  return res.status(200).json({
                                           success : false ,
                                           album_id_Required : 'album_id required'
                                  })
                                 }

                                 // check for album
                                 const album = await eventImageModel.findOne({ _id : album_id })
                                 if(!album)
                                 {
                                  return res.status(200).json({
                                               success : false ,
                                               album_required : 'Album not exist'
                                  })
                                 }

                                 // check for image in the specified image array

                                 let image_found = false

                                 album.images.forEach(imageArray => {
                                  const imageIndex = imageArray.image_entries.findIndex(entry => 
                                        entry._id.toString() === image_id)

                                        if(imageIndex !== -1 )
                                        {
                                            imageArray.image_entries.splice(imageIndex , 1)

                                            image_found = true
                                        }
                                 })

                                    if(!image_found)
                                    {
                                      return res.status(200).json({
                                          success : false ,
                                          message :'image not found'
                                      })
                                    }

                                       await album.save()

                                       return res.status(200).json({
                                             success : true,
                                             message : 'Image Deleted successfully'
                                       })
                            }
                             catch (error) {
                              return res.status(500).json({
                                         success : false ,
                                         serverErrorMessage : 'server Error'
                              })
                            }
                          }


        // Api for get event according to date

       
        const { parse, format, eachDayOfInterval } = require('date-fns');

        const get_Event_on_date = async (req, res) => {
          try {
              const userId = req.params.userId;
              const { month, year, dates } = req.body;
      
              // Check for userId
              if (!userId) {
                  return res.status(200).json({
                      success: false,
                      userId_required: 'userId required',
                  });
              }
      
              const user = await userModel.findOne({ _id: userId });
              if (!user) {
                  return res.status(200).json({
                      success: false,
                      userExistanceMessage: 'user not found',
                  });
              }
      
              const phone_no = user.phone_no;
      
              if (dates && month && year) {
                  const parsedDate = parse(`${month} ${year}`, 'MMM yyyy', new Date());
                  const startDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
                  const endDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
                  const allDatesInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      
                  const eventDetails = [];
                  const created_event_Details = [];
                  const invited_event_details = [];
      
                  for (const date of allDatesInMonth) {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const formattedDate = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
      
                      // Check if the current date is the specified date
                      if (formattedDate === dates) {
                          const created_events = await eventModel.find({
                              userId: userId,
                              'venue_Date_and_time.date': formattedDate,
                          });
                          var dateObj = new Date(formattedDate);

                        // Extract year, month, and day from the date object
                        var year1 = dateObj.getFullYear();
                        var month1 = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because JavaScript months are zero-based
                        var day1 = dateObj.getDate().toString().padStart(2, '0');

                        // Form the desired date string in the format "YYYY-MM-DD"
                        var formattedDates = year1 + "-" + month1 + "-" + day1;
                          const invitedEvents = await InvitedeventModel.find({
                              'Guests.phone_no': phone_no,
                              'venue_Date_and_time.date': formattedDates,
                          });
      
                          created_event_Details.push(...created_events);
                          invited_event_details.push(...invitedEvents);
      
                          eventDetails.push({
                              date: formattedDate,
                              created_eventCount: created_events.length,
                              invited_eventCount: invitedEvents.length,
                          });
                      } else {
                          // If the current date is not the specified date, push an empty entry
                          eventDetails.push({
                              date: formattedDate,
                              created_eventCount: 0,
                              invited_eventCount: 0,
                          });
                      }
                  }
      
                  return res.status(200).json({
                      success: true,
                      message: 'Event Details',
                      eventDetails: eventDetails,
                      created_event_Details: created_event_Details,
                      invited_event_details: invited_event_details,
                  });
              } else if (month && year) {
                  // Handle logic for monthly events
                  const parsedDate = parse(`${month} ${year}`, 'MMM yyyy', new Date());
                  const startDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
                  const endDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
                  const allDatesInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      
                  const eventDetails = [];
                  const created_event_Details = [];
                  const invited_event_details = [];
      
                  for (const date of allDatesInMonth) {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const formattedDate = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
      
                      const events = await eventModel.find({
                          userId: userId,
                          'venue_Date_and_time.date': formattedDate,
                      });
                        var dateObj = new Date(formattedDate);

                      // Extract year, month, and day from the date object
                      var year1 = dateObj.getFullYear();
                      var month1 = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because JavaScript months are zero-based
                      var day1 = dateObj.getDate().toString().padStart(2, '0');

                      // Form the desired date string in the format "YYYY-MM-DD"
                      var formattedDates = year1 + "-" + month1 + "-" + day1;
                     
                      const invitedEvents = await InvitedeventModel.find({
                          'Guests.phone_no': phone_no,
                          'venue_Date_and_time.date': formattedDates,
                      });
      
                      created_event_Details.push(...events);
                      invited_event_details.push(...invitedEvents);
      
                      eventDetails.push({
                          date: formattedDate,
                          created_eventCount: events.length,
                          invited_eventCount: invitedEvents.length,
                      });
                  }
      
                  return res.status(200).json({
                      success: true,
                      message: 'Event Details',
                      eventDetails: eventDetails,
                      created_event_Details: created_event_Details,
                      invited_event_details: invited_event_details,
                  });
              } else {
                  // Handle case where neither date nor month/year is provided
                  return res.status(200).json({
                      success: false,
                      date_required: 'date or month and year are required',
                  });
              }
          } catch (error) {
              console.error(error);
              return res.status(500).json({
                  success: false,
                  message: 'Server error',
              });
          }
      };
      

      

      // APi for get event on month

      // const { parse, format, eachDayOfInterval } = require('date-fns');

      const getEventsByMonth = async (req, res) => {
          try {
              const userId = req.params.userId;
              const { month, year  } = req.query;
      
              // Check for month and year
              if (!month || !year) {
                  return res.status(200).json({
                      success: false,
                      date_required: 'Month and year are required',
                  });
              }
      
              if (!userId) {
                  return res.status(200).json({
                      success: false,
                      userId_required: 'userId required',
                  });
              }
      
              const user = await userModel.findOne({ _id: userId });
      
              if (!user) {
                  return res.status(200).json({
                      success: false,
                      userExistanceMessage: 'User not found',
                  });
              }
      
              const phone_no = user.phone_no;
      
              // Parse the input month and year
              const parsedDate = parse(`${month} ${year}`, 'MMM yyyy', new Date());
              
              // Calculate the start and end dates for the month
              const startDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth() , 1);
              const endDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
      
              // Generate an array of all dates in the month
              const allDatesInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      
              // Fetch created events and invited events for each date in the month
              const eventDetails = {};
      
              for (const date of allDatesInMonth) {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  
                  const events = await eventModel.find({
                      userId: userId,
                      'venue_Date_and_time.date': formattedDate,
                  });
      
                  const invitedEvents = await InvitedeventModel.find({
                      'Guests.phone_no': phone_no,
                      'venue_Date_and_time.date': formattedDate,
                  });
      
                  eventDetails[formattedDate] = {
                      created_event_Details: events || [],
                      invited_event_details: invitedEvents || [], 
                      created_eventCount : (events || []).length,
                      invited_eventCount :  (invitedEvents || []).length
                      
                  };
              }
      
              return res.status(200).json({
                  success: true,
                  message: 'Event Details',
                  eventDetails: eventDetails,
              });
      
          } catch (error) {
              console.error(error);
              return res.status(500).json({
                  success: false,
                  message: 'Server error',
              });
          }
      };
      
      

                                                  /* Event Feed Section */
      // Api for create  feed in event

      const create_feed = async (req, res) => {
        try {
          const { eventId , userId } = req.params;
          const { feed_description } = req.body;
      
          // check for eventId 
          if (!eventId) {
            return res.status(200).json({
              success: false,
              message: 'Event Id required'
            });
          }
      
          // check for eventId 
          if (!eventId) {
            return res.status(200).json({
              success: false,
              message: 'Event Id required'
            });
          }
      
          // check for event Existence
          const event = await eventModel.findOne({ _id: eventId });
          if (!event) {
            return res.status(200).json({
              success: false,
              message: 'Event not found'
            });
          }   
        

          //check for user
         const user = await userModel.findOne({
                      _id: userId
         })
           const user_profileImage = user.profileImage
           const userName =  user.fullName
      
          // check for feed description field
          if (!feed_description) {
            return res.status(200).json({
              success: false,
              message: 'Feed description required'
            });
          }
      
          // Initialize the review section with default values
          const defaultReview = {
            likes: 0,
            comments: [],
            views: 0
          };
      
          // image upload for post
          const Image = req.file ? req.file.filename : null;
      
          // Create a new event feed using the schema
          const newEventFeed = new eventFeedModel({
            userId: userId,
            userName: userName,
            user_profileImage: user_profileImage,
            eventId: eventId,
            feed_description: feed_description,
            feed_image: Image,
            review: defaultReview
          });
      
          // Save the new event feed to the database
          await newEventFeed.save();
      
          return res.status(200).json({
            success: true,
            message: 'Event feed created successfully',
            feed_Id : newEventFeed._id
          });
      
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: 'Server error'
          });
        }
      };
      
  // api for get all feeds 
                    const get_allfeeds = async (req, res) => {
                      try {
                        const eventId = req.params.eventId;
                    
                        // Check for eventId
                        if (!eventId) {
                          return res.status(200).json({
                            success: false,
                            message: 'Event Id is required'
                          });
                        }
                    
                        // Check for all feeds
                        const all_feeds = await eventFeedModel.find({ eventId: eventId });
                    
                        if (!all_feeds || all_feeds.length === 0) {
                          return res.status(200).json({
                            success: false,
                            message: 'No feeds found for the event'
                          });
                        } else {
                          // Map each feed to extract necessary information
                          const formattedFeeds = all_feeds.map(feed => {
                            const originalDate = new Date(feed.createdAt);
                            const formattedDate = `${originalDate.getUTCFullYear()}-${(originalDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${originalDate.getUTCDate().toString().padStart(2, '0')} ${originalDate.getUTCHours().toString().padStart(2, '0')}:${originalDate.getUTCMinutes().toString().padStart(2, '0')}:${originalDate.getUTCSeconds().toString().padStart(2, '0')}`;
                    
                            return {
                              feed_id: feed._id,
                              eventId: feed.eventId,
                              userId: feed.userId,
                              userName: feed.userName,
                              user_profileImage: feed.user_profileImage,
                              feed_description: feed.feed_description,
                              feed_image: feed.feed_image,
                              feed_created_time: formattedDate,
                              feed_likes: feed.feed_review ? feed.feed_review.like_count || 0 : 0,
                              feed_comments: feed.feed_review ? feed.feed_review.comment_count || 0 : 0,
                              feed_views: feed.feed_review ? feed.feed_review.view_count || 0 : 0
                            };
                          });
                    
                          return res.status(200).json({
                            success: true,
                            message: 'All feeds details for the event',
                            feeds: formattedFeeds
                          });
                        }
                      } catch (error) {
                        console.error(error);
                        return res.status(500).json({
                          success: false,
                          message: 'Server error'
                        });
                      }
                    };
                    
                    
  

// APi for delete user feed
                  const delete_user_feed = async (req, res) => {
                    try {
                      const { userId , feed_Id} = req.params;

                      if (!userId) {
                        return res.status(200).json({
                          success: false,
                          message: 'UserId required',
                        });
                      }
                      if (!feed_Id) {
                        return res.status(200).json({
                          success: false,
                          message: 'feed_Id required',
                        });
                      }

                      // Check for feed
                      const feed = await eventFeedModel.findOne({ 
                            userId: userId ,
                            _id : feed_Id });

                      if (!feed) {
                        return res.status(200).json({
                          success: false,
                          message: 'Feed not found',
                        });
                      } else {
                        // Delete the feed
                        await eventFeedModel.deleteOne({ userId: userId , _id : feed_Id });

                        return res.status(200).json({
                          success: true,
                          message: 'Feed deleted successfully',
                        });
                      }
                    } catch (error) {
                      return res.status(500).json({
                        success: false,
                        message: 'Server error',
                        error_message: error.message,
                      });
                    }
                  };

// APi for give like/ unlike to feed in event
                const like_unlike_feed = async (req, res) => {
                  try {
                    const { feed_Id, userId } = req.params;

                    // check for userId and feed_Id required
                    if (!userId) {
                      return res.status(200).json({
                        success: false,
                        message: 'userId required'
                      });
                    }
                    if (!feed_Id) {
                      return res.status(200).json({
                        success: false,
                        message: 'feed Id required'
                      });
                    }

                    // check for feed existence
                    const feed = await eventFeedModel.findOne({ _id: feed_Id });
                    if (!feed) {
                      return res.status(200).json({
                        success: false,
                        message: 'feed not found'
                      });
                    }

                    // check for user existence
                    const user = await userModel.findOne({ _id: userId });
                    if (!user) {
                      return res.status(200).json({
                        success: false,
                        message: 'user not found'
                      });
                    }

                    // check if the user already liked the feed
                    const likedIndex = feed.feed_review.likes.indexOf(userId);
                    

                    if (likedIndex >= 0) {
                      // User has already liked, so unlike
                      feed.feed_review.likes.splice(likedIndex, 1);
                      feed.feed_review.like_count -= 1; // Update like count
                      await feed.save();

                      return res.status(200).json({
                        success: true,
                        message: 'Feed unliked successfully',
                        isLiked: 0 // Set isLiked to 0 for unlike
                      });
                    } else {
                      // User has not liked, so like
                      feed.feed_review.likes.push(userId);
                      feed.feed_review.like_count += 1; // Update like count
                      await feed.save();

                      return res.status(200).json({
                        success: true,
                        message: 'Feed liked successfully',
                        isLiked: 1 // Set isLiked to 1 for like
                      });
                    }
                  } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                      success: false,
                      message: 'Server error'
                    });
                  }
                };


// API for add comments in feed
                  const add_comments = async (req, res) => {
                    try {
                      const { userId, feed_Id } = req.params;
                      const comment = req.body.comment;

                      // check for feed_id and userId required
                      if (!feed_Id) {
                        return res.status(200).json({
                          success: false,
                          message: 'feed_Id is required',
                        });
                      }

                      if (!userId) {
                        return res.status(200).json({
                          success: false,
                          message: 'user Id required',
                        });
                      }

                      // check for comment required
                      if (!comment) {
                        return res.status(200).json({
                          success: false,
                          message: 'comment section is required',
                        });
                      }

                      // check for feed
                      const feed = await eventFeedModel.findOne({ _id: feed_Id });

                      if (!feed) {
                        return res.status(200).json({
                          success: false,
                          message: 'feed not found',
                        });
                      }

                      // check for user
                      const user = await userModel.findOne({ _id: userId });

                      if (!user) {
                        return res.status(200).json({
                          success: false,
                          message: 'user not exist',
                        });
                      }

                      // access user name from user
                      const userName = user.fullName;
                      const user_image =  user.profileImage

                      // push the comment in feed comment array of feed_review
                      const newComment = {
                        userName: userName,
                        user_image : user_image,
                        text_comment: comment,
                      };

                      feed.feed_review.comments.push(newComment);
                      feed.feed_review.comment_count += 1;

                      // Save the updated feed
                      await feed.save();

                      return res.status(200).json({
                        success: true,
                        message: 'Comment added successfully',
                        comment: newComment,
                      });
                    } catch (error) {
                      return res.status(500).json({
                        success: false,
                        message: 'server error',
                        error_message: error.message,
                      });
                    }
                  };


          // api for get all comments in feed of event

               const get_all_comments = async ( req ,res)=>{
                    try { 
                           const { feed_Id } = req.params
                        // check for feed Id required
                      if(!feed_Id)
                      {
                        return res.status(200).json({
                                     success : false ,
                                     message : 'feed Id Required'
                        })
                      }

                      // check for feed existance
                    const feed = await eventFeedModel.findOne({ _id : feed_Id })

                         if(!feed)
                         {
                          return res.status(200).json({
                                    success : false ,
                                    message : 'feed not found'
                          })
                         }
                         
                      const comments = feed.feed_review.comments
                          return res.status(200).json({
                                      success : true ,
                                      message : 'all comments of the feed ',
                                      all_comments : comments
                          })                      
                    } catch (error) {
                      return res.status(500).json({
                           success : false ,
                           message : 'server error'
                      })
                    }
               }

        
     // Api for create views on feed
     const viewFeed = async (req, res) => {
      try {
        const { feed_Id, userId } = req.params;
    
        // check for feed_id
        if (!feed_Id) {
          return res.status(200).json({
            success: false,
            message: 'Feed Id required',
          });
        }
    
        // check  user_id
        if (!userId) {
          return res.status(200).json({
            success: false,
            message: 'userId Id required',
          });
        }
    
        // check for feed
        const feed = await eventFeedModel.findOne({ _id: feed_Id });
    
        if (!feed) {
          return res.status(200).json({
            success: false,
            message: 'Feed not exist',
          });
        }
    
        // Ensure that the 'views' property is initialized as an array
        feed.feed_review.views = feed.feed_review.views || [];
    
        // Check if the user has already viewed this feed
        if (!feed.feed_review.views.includes(userId)) {
          // Increment both view_count and add userId to views array
          feed.feed_review.views.push(userId);
          feed.feed_review.view_count += 1;
          await feed.save();
    
          return res.status(200).json({
            success: true,
            message: 'User viewed feed successfully',
            views: feed.feed_review.views.length,
            view_count: feed.feed_review.view_count,
          });
        } else {
          // User with the same userId has already viewed, no change in counts
          return res.status(200).json({
            success: true,
            message: 'User viewed feed successfully',
            views: feed.feed_review.views.length,
            view_count: feed.feed_review.view_count,
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: 'Server error',
        });
      }
    };
    
    
    
    
    
                     
        
            module.exports = {
                    userSignUp , userLogin , create_Event , newVenue_Date_Time , add_co_host ,
                     edit_Venue_Date_Time , delete_Venue_Date_Time , add_guest , import_Guest ,
                     getAllGuest  , addAllGuestsToBookmark , deleteGuestInCollection , searchEvent ,
                     getFilteredEvent , feedback , deleteEvent , deleteUser , getImages , delete_co_Host , getAllEvents,
                     getUserEvent   , contactUsPage , faqPage , sendInvitation , getMyInvitation , updateEvent , getEvent,
                     getAllInvited_Event , getVenuesOf_Event , userRespondToInvitedEvent , getAll_co_Hosts , getAllGuest_with_Response ,
                     delete_Guest , getallResponseEvent , updateUser , numberExistance , getSubEventOf_Event , getUser , deleteAllEvents ,
                     createEventAlbum , getAllAlbum , getParticularAlbum , addImages_in_Album , rename_album , deleteAlbum , deleteImage ,
                     get_Event_on_date , create_feed , get_allfeeds , delete_user_feed , like_unlike_feed , add_comments , get_all_comments ,
                     viewFeed , getEventsByMonth
}