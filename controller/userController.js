const userModel = require('../models/userModel')
const eventModel = require('../models/eventModel')
const bookmarkModel = require('../models/bookmarkModel')
const feedbackModel = require('../models/feedbackModel')

const cors = require('cors')
const upload = require('../utils/uploads')
const fs = require('fs')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const path = require('path')
const ExcelJs = require('exceljs')
const FirebaseAdmin = require('../utils/firebaseService')

const Admin = require('../models/AdminModel')

                                /* API for users */
    // API for user signup
     
    const userSignUp = async (req, res) => {
      try {
          const { fullName, phone_no , email } = req.body;
  
          // Validation
          const requiredFields = ['fullName', 'phone_no' , 'email'];
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
          const imagePath = req.file.filename;
          const newUser = new userModel({
              fullName,
              phone_no,
              profileImage: imagePath,
              user_status: userModel.schema.path('user_status').getDefault(),
              email
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
                  email : saveUser.email
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
          const userId = req.params.userId
          const { title, description, event_Type, venue_Date_and_time  } = req.body;
      
          const requiredFields = ['title', 'description', 'event_Type', 'venue_Date_and_time'];
          for (const field of requiredFields) {
            if (!req.body[field]) {
              return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
            }
          }
             // check for user 
             const user = await userModel.findOne({ _id : userId })
             if(!user)
             {
              return res.status(400).json({ success : false , message : `user not found`})
             }
                 const userName = user.fullName                 
          // Check if an event with the same date and time already exists in the venue_Date_and_time 
          const existingEvent = await eventModel.findOne({
            'venue_Date_and_time.date': venue_Date_and_time.date,
            'venue_Date_and_time.start_time': venue_Date_and_time.start_time,
            'venue_Date_and_time.end_time': venue_Date_and_time.end_time,
            'venue_Date_and_time.venue_location' : venue_Date_and_time.venue_location
          });                    

          if (existingEvent) {
            return res.status(400).json({ message: ' venue with date and time already exist in venue location ', success: false });
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
            venue_Date_and_time: [
              {
                venue_Name: venue_Date_and_time.venue_Name,
                venue_location: venue_Date_and_time.venue_location,
                date: venue_Date_and_time.date,
                start_time: venue_Date_and_time.start_time,
                end_time: venue_Date_and_time.end_time
              }
            ],
            images: imagePaths,
            userId : userId,
            userName : userName,
            event_status :  eventModel.schema.path('event_status').getDefault(),           
            
          });
      
          const saveEvent = await newEvent.save();
          const newAdminNotification = new AdminNotificationDetail({
            userId  , 
            userName : userName    ,                                    
            message: `congratulation ..!! , new event : ${saveEvent._id} has been made by the user : ${userName}  `,
            date: new Date(),    
          
          });
          await newAdminNotification.save()
          res.status(200).json({
            success: true,
            message: 'Event created successfully',
            event_details: saveEvent
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
            const {venue_Name , venue_location, date , start_time , end_time} = req.body     
            try {
                const requiredFields = [                
                    'venue_Name', 
                    'venue_location',                                                                          
                    'date' ,
                    'start_time',
                    'end_time'     
            
                ];
                      for (const field of requiredFields){
                        if(!req.body[field])
                        {
                          return res.status(400).json({ message : `missing ${field.replace('_', ' ')} field`, success: false})
                        }
                      }                

                const event = await eventModel.findOne({ _id:eventId })
      
                if(!event)
                {
                    return res.status(400).json({ success : false , message : `event not found with the eventId ${eventId}`})
                }

                  //  newVenue_Date_Time is an array in the event model
              const duplicateVenue_Date_Time = event.venue_Date_and_time.find((venue) => venue.venue_Name === venue_Name);

              if (duplicateVenue_Date_Time) {
                return res.status(400).json({ success: false, message: `venue '${venue_Name}' already exists in a event` });
              }
                 const dates =  new Date(date)
              event.venue_Date_and_time.push({
                venue_Name, 
                venue_location,                               
                date:dates,
                start_time,
                end_time

            })
            await event.save()
            return res.status(200).json({ 
                                  success : true , 
                                message : `venue added successfully in eventId : ${eventId}`})
            } catch (error) {
                return res.status(500).json({
                    success : false ,
                    message : ' there is an server error'
                })
            }
           }

// add co host
                    const add_co_host = async (req,res)=>{
                        const eventId = req.params.eventId
                        const {co_host_Name , phone_no} = req.body  
                                try {
                         const requiredFields = [                
                                'co_host_Name', 
                                'phone_no',                                                                       
                              ];
  
                            for (const field of requiredFields) {
                                if (!req.body[field]) {
                                    return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                }
                            }

                            // check for phone_no 
                        const existPhoneNumber = await eventModel.findOne({ phone_no })
                        if(existPhoneNumber)
                        {
                          return res.status(400).json({ message : `co host with the phone number :  ${phone_no} is already exist `})
                        }

                          const event = await eventModel.findOne({ _id:eventId })                          
                        if(!event)
                        {
                            return res.status(400).json({ success : false , message : `event not found with the eventId ${eventId}`})
                        }
                        event.co_hosts.push({
                            co_host_Name, 
                            phone_no                          
                   })
                      await event.save()
                      return res.status(200).json({ 
                                success : true , 
                                message : `co-host added successfully in eventId : ${eventId}`})
                    } catch (error) {
                        return res.status(500).json({
                            success : false ,
                            message : 'there is an server error'
                        })
                    }
        }
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
                                                      message : `event : ${eventId} not found`
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
                                    message : `co-host deleted successfully in eventId : ${eventId}`
                  })

                                } catch (error) {
                                  return res.status(500).json({
                                                            success : false ,
                                                            message : 'there is an server error'
                                  })
                                }
                              }
                             
 
// API for edit Venue_Date_Time 
                    const edit_Venue_Date_Time = async (req ,res)=>{
                      let eventId;
                      try {
                          const venueId = req.params.venueId;
                          eventId = req.params.eventId;
                          const {venue_Name , venue_location, date , start_time , end_time} = req.body
                          // Check for event existence
                          const existEvent = await eventModel.findOne({ _id: eventId });
                          if (!existEvent) {
                              return res.status(404).json({ success: false, message: "event not found" });
                          }
                              // Check if the venue_Date_and_time array exists within event

                                if(!existEvent.venue_Date_and_time || !Array.isArray(existEvent.venue_Date_and_time))
                                {
                                  return res.status(400).json({ success : false ,
                                                                message : "venue date and time not found in the route"})
                                }

                              // Check for venueIndex
                          const existVenueIndex = existEvent.venue_Date_and_time.findIndex(
                              (venue) => venue._id.toString() === venueId
                          );
                          if (existVenueIndex === -1) {
                              return res.status(404).json({ success: false, message: "venue not found" });
                          }
                            const dates =  new Date(date)
                              // Update the properties of the venue
                            existEvent.venue_Date_and_time[existVenueIndex].venue_Name = venue_Name
                            existEvent.venue_Date_and_time[existVenueIndex].venue_location = venue_location
                            existEvent.venue_Date_and_time[existVenueIndex].date = dates
                            existEvent.venue_Date_and_time[existVenueIndex].start_time = start_time
                            existEvent.venue_Date_and_time[existVenueIndex].end_time = end_time
                            
                              // Save the updated event back to the database
                              await existEvent.save()
                              return res.status(200).json({
                                                          success : true ,
                                                          message : `venue edited successfully for event : ${eventId}`
                              })
                          
                                  } catch (error) {
                                      return res.status(500).json({
                                          success : false ,
                                          message : 'there is an server error'
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
                                                             message : "venue not found "
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
                                                      message : `venue deleted successfully in eventId : ${eventId}`
                                    })


                                  } catch (error) {
                                      return res.status(500).json({
                                          success : false,
                                          message : ' there is an server error'
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
                                          // check for event

                                  const event = await eventModel.findOne({ _id: eventId });

                                  if (!event) {
                                      return res.status(400).json({ success: false, message: `Event not found with the eventId ${eventId}` });
                                  }
                                            // check for duplicate guest
                                 
                                  const duplicateGuest =  event.Guests.find((guest) => guest.phone_no === phone_no);

                                  if (duplicateGuest) {
                                      return res.status(400).json({ success: false, message: `Guest with phone number '${phone_no}' already exists in the event` });
                                  }

                                  // Add the new guest to the Guests array
                                  event.Guests.push({
                                      Guest_Name,
                                      phone_no,
                                      status: 0,
                                  });

                                  await event.save();

                                  return res.status(200).json({
                                      success: true,
                                      message: `Guest added successfully in eventId: ${eventId}`,
                                  });
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

                                                              
                          
  // API to add all guest as favourite in bookmark 
                          const addAllGuestsToBookmark = async (req, res) => {
                            try {
                              const eventId = req.params.eventId;
                              const collectionName = req.body.collectionName
                          
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
                          
                              // Iterate through all unique guests in the event and add to bookmark
                              for (const guest of uniqueGuests) {
                                // Check if the guest is already in the bookmark
                                const existingBookmark = await bookmarkModel.findOne({
                                  Guest_Name: guest.Guest_Name,
                                  phone_no: guest.phone_no,
                                  collectionName : collectionName
                                });
                          
                                // If not in the bookmark, add to bookmark with status code 1
                                if (!existingBookmark) {
                                  const bookMarkEntry = new bookmarkModel({
                                    Guest_Name: guest.Guest_Name,
                                    phone_no: guest.phone_no,
                                    status: 1,
                                    collectionName : collectionName
                                  });
                          
                                  // Save the bookmark entry
                                  await bookMarkEntry.save();
                                }
                              }
                          
                              res.status(200).json({
                                success: true,
                                message: 'All guests added to bookmark as favorites',
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
                         const deleteGuestInCollection = async (req ,res)=> {
                          try {
                            const guestId = req.params.guestId
                            collectionName = req.body.collectionName

                            
                            // check for guest
                            const guest = await bookmarkModel.findOneAndDelete({
                              _id:guestId,
                              collectionName
                            })
                            
                              if(!collectionName)
                              {
                                return res.status(400).json({
                                                       success : false ,
                                                       message : 'please provide collection Name'
                                })
                              }
                            if(!guest)
                            {
                              return res.status(400).json({
                                                       success : false ,
                                                       message  : `Guest not found in collection  : ${collectionName}`
                              })
                            }
                            res.status(200).json({
                                                  success : true,
                                                  message : `Guest deleted Successfully in collection : ${collectionName}`
                            })
                            

                          } catch (error) {
                            console.error(error);
                            return res.status(500).json({
                                                   success : false ,
                                                   message : ' there is an server error '
                            })
                          }
                         }
                            
      // get an particular event
                                 const searchEvent = async (req , res)=>{
                                  try {
                                       const event_Type = req.body.event_Type                                     

                                       // check for event existnace
                                       const event = await eventModel.findOne({ event_Type : event_Type })
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
                                                                   message : `Event`,
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
                                              year,
                                              month,
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
                                              filter['venue_Date_and_time.date'] = new Date(date);
                                            } else if (year && month) {
                                              // If year and month are provided, filter by year and month
                                              const startDate = new Date(`${year}-${month}-01`);
                                              const endDate = new Date(`${year}-${parseInt(month) + 1}-01`);
                                              filter['venue_Date_and_time.date'] = {
                                                $gte: startDate,
                                                $lt: endDate,
                                              };
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
                    res.status(200).json({
                      success: true,
                      message: 'All Events',
                      events_data: events,
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
                        return res.status(200).json({
                                       success : true ,
                                       message : 'user events',
                                       events : event
                        })
                      }

                    } catch (error) {
                      return res.status(500).json({
                                  success : false ,
                                  message : 'there is a server error '
                      })
                    }
                  }

      
module.exports = {
                    userSignUp , userLogin , create_Event , newVenue_Date_Time , add_co_host ,
                     edit_Venue_Date_Time , delete_Venue_Date_Time , add_guest , import_Guest ,
                     getAllGuest  , addAllGuestsToBookmark , deleteGuestInCollection , searchEvent ,
                     getFilteredEvent , feedback , deleteEvent , deleteUser , getImages , delete_co_Host , getAllEvents,
                     getUserEvent 

}