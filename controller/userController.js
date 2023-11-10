const userModel = require('../models/userModel')
const eventModel = require('../models/eventModel')
const bookmarkModel = require('../models/bookmarkModel')

const cors = require('cors')
const upload = require('../utils/uploads')
const fs = require('fs')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const path = require('path')
const ExcelJs = require('exceljs')

                                /* API for users */
    // API for user signup
     
                     const userSignUp = async (req,res)=>{
                        try {
                             const { fullName , phone_no} = req.body
                             const requiredFields = [
                                'fullName' ,
                                'phone_no'                        
                            ];
                             for (const field of requiredFields) {
                                if (!req.body[field]) {
                                    return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                }
                            }

                                // Check for Phone number
                        const existPhoneNumber = await userModel.findOne({ phone_no });
                    
                        if (existPhoneNumber) {
                          return res.status(400).json({ message: 'user with the same Number is Already Exist', success: false });
                        }

                        const imagePath = req.file.filename;

                        const newUser = new userModel({
                            fullName ,
                            phone_no,
                            profileImage : imagePath
                        })
                                const saveUser = await newUser.save()

                                res.status(200).json({
                                    success : true,
                                    message : ' user created successfully',
                                    user_details : saveUser
                                })
                        } catch (error) {
                           
                            res.status(500).json({
                                success : false,
                                message : 'there is an server error '
                            })
                        }
                     }

    // user login
                    const userLogin = async(req,res)=>{                      
                        try {
                        const { phone_no } = req.body;
                    
                        // Find Admin by email
                        const user = await userModel.findOne({ phone_no });
                    
                        if (user) {
                            
                            return res.json({ message: 'user Login Successful', success: true, data: user });
                        } else {
                            return res.status(401).json({ message: 'phone_no not found', success: false });
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
          const { title, description, event_Type, venue_Date_and_time } = req.body;
      
          const requiredFields = ['title', 'description', 'event_Type', 'venue_Date_and_time'];
          for (const field of requiredFields) {
            if (!req.body[field]) {
              return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
            }
          }
                                   
          // Check if an event with the same date and time already exists in the venue_Date_and_time 
          const existingEvent = await eventModel.findOne({
            'venue_Date_and_time.date': venue_Date_and_time.date,
            'venue_Date_and_time.start_time': venue_Date_and_time.start_time,
            'venue_Date_and_time.end_time': venue_Date_and_time.end_time
          });
                     

          if (existingEvent) {
            return res.status(400).json({ message: 'An event with the same venue, date, and time already exists', success: false });
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
            images: imagePaths
          });
      
          const saveEvent = await newEvent.save();
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

                for (const field of requiredFields) {
                    if (!req.body[field]) {
                        return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
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

                        const existPhoneNumber = await eventModel.findOne({ phone_no });                   
                         if (existPhoneNumber) {
                            return res.status(400).json({ message: 'co-host with the same Number is Already Exist', success: false });
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

                if (!existEvent.venue_Date_and_time || !Array.isArray(existEvent.venue_Date_and_time)) {
                    return res
                    .status(400)
                    .json({ success: false, message: "venue_Date_and_time array not found in the route" });
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
                existEvent.venue_Date_and_time[existVenueIndex].venue_location = venue_location;
                existEvent.venue_Date_and_time[existVenueIndex].date = dates;
                existEvent.venue_Date_and_time[existVenueIndex].start_time = start_time;
                existEvent.venue_Date_and_time[existVenueIndex].end_time = end_time;
                // Save the updated event back to the database
              await existEvent.save();
                
                res.status(200).json({
                    success: true,
                    message: `venue is edited successfully for eventId: ${eventId}`,
                });

        } catch (error) {
            return res.status(500).json({
                success : false ,
                message : 'there is an server error'
            })
        }
      }

// API for delete venue in a Event
        const delete_Venue_Date_Time = async (req ,res)=>{
            let eventId
            try {
                  const venueId = req.params.venueId
                  const eventId = req.params.eventId

                  const existEvent = await eventModel.findById(eventId)
                  if(!existEvent)
                  {
                    res.status(400).json({
                                  success : false,
                                  message : 'event not found'
                    })
                  }

                  // check for venue
          const existVenueIndex = existEvent.venue_Date_and_time.findIndex(venue => venue._id.toString() === venueId)
          if(existVenueIndex === -1)
          {
            return res.status(404).json({ success : false , message : " venue not found"})
         }
         
         
             // remove the venue from the venue_Date_and_Time array
             existEvent.venue_Date_and_time.splice(existVenueIndex, 1)

              await eventModel.findByIdAndUpdate(
                    { _id:eventId },
                    {venue_Date_and_time : existEvent.venue_Date_and_time}
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
                    const add_guest = async (req , res)=>{
                        try {
                                const eventId = req.params.eventId
                                const {Guest_Name , phone_no} = req.body

                                    const requiredFields = [                
                                        'Guest_Name', 
                                        'phone_no'                                                                      
                                   ];
                    
                                    for (const field of requiredFields) {
                                        if (!req.body[field]) {
                                            return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                        }
                                    }

                                    const event = await eventModel.findOne({ _id:eventId })
                          
                                if(!event)
                                {
                                    return res.status(400).json({ success : false , message : `event not found with the eventId ${eventId}`})
                                }
                                      //  Guests is an array in the event model
                                  const duplicateGuest = event.Guests.find((guest) => guest.phone_no === phone_no);

                                  if (duplicateGuest) {
                                    return res.status(400).json({ success: false, message: `Guest '${phone_no}' already exists in a event` });
                                  }
                                  event.Guests.push({
                                    Guest_Name,                                                                    
                                    phone_no ,
                                    status :0
                                })
                                await event.save()
                                 
                                return res.status(200).json({
                                                success : true ,
                                                 message : `Guest added successfully in eventId : ${eventId}`})
                     }
                      catch (error) {
                            return res.status(500).json({
                                success : false,
                                message : ' there is an server error'
                            })
                        }
                    }

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

        //API for add Guest in BookMark
                          const favourite_Guest = async (req,res)=>{
                                  try {
                                    const eventId = req.params.eventId
                                    const guestId = req.params.guestId

                                    // check event existance
                                    const event = await eventModel.findOne({ _id:eventId})
                                    if(!event)
                                    {
                                      res.status(400).json({
                                                        success : false,
                                                        message : 'no event found'
                                      })
                                      return
                                    }
                                         // check for Guest
                              const existGuestIndex = event.Guests.findIndex(guest => guest._id.toString() === guestId)
                              if(existGuestIndex === -1)
                              {
                                return res.status(400).json({ success : false , message : "guest not found"})
                                }  
                                event.Guests[existGuestIndex].status = 1
                                await event.save()
                                         // Get the Guest details
                                         const guest = event.Guests[existGuestIndex]

                                         // create a new Bookmark entry with guest details and status code
                                         const bookMarkEntry = new bookmarkModel({
                                          Guest_Name : guest.Guest_Name,
                                          phone_no : guest.phone_no,
                                          status : 1
                                         })
                                         // save the bookmark entry 
                                         await bookMarkEntry.save()

                                         res.status(200).json({ 
                                                   success : true ,
                                                   message : 'guest added to bookmark as favourite',
                                                   bookMarkEntry
                                         })
                                  } catch (error) {
                                    return res.status(500).json({
                                      success : false,
                                      message : 'there is an server error'
                                    })
                                  }
                          }
                      
        
                     

module.exports = {
                    userSignUp , userLogin , create_Event , newVenue_Date_Time , add_co_host ,
                     edit_Venue_Date_Time , delete_Venue_Date_Time , add_guest , import_Guest ,
                     getAllGuest , favourite_Guest
}