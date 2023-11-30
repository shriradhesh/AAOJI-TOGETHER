const cors = require('cors')
const upload = require('../utils/uploads')
const fs = require('fs')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const eventModel = require('../models/eventModel')
const Admin = require('../models/AdminModel')
const bcrypt = require('bcrypt')
const tokenModel = require('../models/tokenModel')
const Adminforgetpass_sentEmail = require('../utils/AdminSendEmails')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bookmarkModel = require('../models/bookmarkModel')
const feedbackModel = require('../models/feedbackModel')
                                             /* API's  */
// API for login ADMIN 
const login_Admin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find Admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: 'Email incorrect', success: false });
        }

        // Check if the stored password is in plain text
        if (admin.password && admin.password.startsWith('$2b$')) {
            // Password is already bcrypt hashed
            const passwordMatch = await bcrypt.compare(password, admin.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Password incorrect', success: false });
            }
        } else {
            // Convert plain text password to bcrypt hash
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Update the stored password in the database
            admin.password = hashedPassword;
            await admin.save();
        }

        return res.json({ message: 'Admin Login Successful', success: true, data: admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};


         // APi for change password
                     const changePassword = async (req,res)=>{
                        try {
                            const id = req.params.id
                            const {oldPassword , newPassword , confirmPassword} = req.body

                            const requiredFields = [
                                'oldPassword',
                                'newPassword',       
                                'confirmPassword',     
                            ];
                        
                            for (const field of requiredFields) {
                                if (!req.body[field]) {
                                    return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                }
                            }
                                   // check if new Password is matched with confirm password
                                if(newPassword !== confirmPassword)
                                {
                                    return res.status(400).json({
                                                         success : false ,
                                                         message  : 'password not matched'
                                    })
                                }  
                            
                                // check for admin
                                const admin = await Admin.findOne({ _id:id})
                                if(!admin)
                                {
                                    res.status(400).json({
                                                  success : false ,
                                                  message : ' admin not found'
                                    })
                                }
                                else
                                {
                                   const isOldPasswordValid = await bcrypt.compare(oldPassword , admin.password)
                                      if(!isOldPasswordValid)
                                      {
                                        return res.status(400).json({
                                                           success : false ,
                                                           message : 'old password not valid'
                                        })
                                      }
                                      // bcrypt the old password
                                      const hashedNewPassword = await bcrypt.hash(newPassword , 10)
                                      admin.password = hashedNewPassword
                                      await admin.save()

                                      return res.status(200).json({
                                                               success : true ,
                                                               message : 'password change successfully'
                                      })
                                }
                        } catch (error) {
                            return res.status(500).json({
                                               success : false ,
                                               message : ' there is an server error '
                            })
                        }
                     }


// API for token generate and email send to Admin email
                                        const forgetPassToken = async(req,res)=>{
                                                    
                                            try{
                                            const { email } = req.body;

                                            if (!email || !isValidEmail(email)) {
                                                return res.status(400).json({
                                                            success : false,
                                                            message : "Valid email is required"
                                                })
                                            }

                                            const admin = await Admin.findOne({ email })

                                            if(!admin)
                                            {
                                                return res.status(404).json({ success: false, message : ' admin with given email not found'})
                                            }
                                                
                                                let token = await tokenModel.findOne({ adminId : admin._id })
                                                if(!token){
                                                    token = await new tokenModel ({
                                                        adminId : admin._id,
                                                    token : crypto.randomBytes(32).toString("hex")
                                                    }).save()
                                                }

                                                const link = `${process.env.AdminForgetpassURL}`
                                                await Adminforgetpass_sentEmail(admin.email, "Password reset", link)

                                                res.status(200).json({success : true ,messsage  : "password reset link sent to your email account" , token : token})
                                                
                                        }
                                        catch(error)
                                        {
                                                    console.error(error);
                                            res.status(500).json({success : false , message : "An error occured" , error : error})
                                        }
                                        function isValidEmail(email) {
                                            // email validation
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            return emailRegex.test(email);
                                        }
                                        }


               // admin reset password for using token

                                    const reset_password = async (req , res)=>{
                                        try {
                                            const { password , confirmPassword} = req.body
                                            const tokenValue = req.params.tokenValue
                                                
                                            if(!password )
                                            {
                                                return res.status(400).json({
                                                                success : false,
                                                                message : 'password  is required'
                                                })
                                            }
                                            if(!confirmPassword )
                                            {
                                                return res.status(400).json({
                                                                success : false,
                                                                message : 'confirmPassword  is required'
                                                })
                                            }

                                            if(password !== confirmPassword)
                                            {
                                                return res.status(400).json({
                                                                    success : false ,
                                                                    message : 'password not matched'
                                                })
                                            }

                                                // check if password reset token exist in token model 
                                                const token = await tokenModel.findOne({ token : tokenValue})
                                                if(!token)
                                                {
                                                    return res.status(400).json({
                                                                        success : false,
                                                                        message : 'invalid token'
                                                    })
                                                }
                                                    const admin = await Admin.findById(token.adminId)

                                                    if(!admin)
                                                    {
                                                        return res.status(400).json({
                                                                    success : false,
                                                                    message : 'invalid admin '
                                                        })
                                                    }
                                                const hashedPassword = await bcrypt.hash(password , 10)
                                                admin.password = hashedPassword
                                                await admin.save()

                                                await token.deleteOne({ token : tokenValue})
                                                
                                                res.status(200).json({
                                                            success : true ,
                                                            message : 'password reset successfully'
                                                })
                                            
                                        } catch (error) {
                                            return res.status(500).json({
                                                        success : false,
                                                        message : 'there is an server error'
                                            })
                                        }
                                    }

               // APi to get admin details
                                const getAdmin = async(req,res)=>{
                                    try {
                                        const adminId = req.params.adminId
                                        // check for admin exsitance
                                    const admin = await Admin.findOne({ _id : adminId })
                                    if(!admin)
                                    {
                                        return res.status(400).json({
                                                            success : false ,
                                                            message : ' Admin not found'
                                                        })
                                     }
                                     else
                                     {
                                        return res.status(200).json({ 
                                                       success : true ,
                                                       message : 'Admin details',
                                                       admin_details : [{
                                                                    firstName : admin.firstName,
                                                                    lastName : admin.lastName,
                                                                    email : admin.email,
                                                                    profileImage : admin.profileImage
                                                                    
                                                       }]
                                        })
                                     }

                                    } catch (error) {
                                        return res.status(500).json({
                                                      success : false ,
                                                      message : 'server error'
                                        })
                                    }   
                                }

    // Admin change profileImage
                                            const changeProfile = async (req, res) => {
                                                try {
                                                    const adminId = req.params.AdminId;
                                                    const { firstName , lastName , email} = req.body

                                                    const requiredFields = [
                                                        'firstName' ,
                                                        'lastName' ,
                                                        'email'                    
                                                    ];
                                                     for (const field of requiredFields) {
                                                        if (!req.body[field]) {
                                                            return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                                        }
                                                    }
                                            
                                                    // Check for admin existence
                                                    const admin = await Admin.findById(adminId);
                                            
                                                    if (!admin) {
                                                        return res.status(400).json({
                                                            success: false,
                                                            message: "Admin not found",
                                                        });
                                                    }
                                                                // Update firstName, lastName, and email
                                                            admin.firstName = firstName
                                                            admin.lastName = lastName
                                                            admin.email = email

                                                    const profile = req.file.filename;
                                            
                                                    // Check if admin already has a profile image
                                                    if (admin.profileImage) {
                                                        // Admin has a profile image, update it
                                                        admin.profileImage = profile;
                                                        await admin.save();
                                            
                                                        return res.status(200).json({
                                                            success: true,
                                                            message: 'Profile image and Information updated successfully',
                                                        });
                                                    } else {
                                                        // Admin does not have a profile image, create it
                                                        admin.profileImage = profile;
                                                        await admin.save();
                                            
                                                        return res.status(200).json({
                                                            success: true,
                                                            message: 'new Profile image created and information updated successfully',
                                                        });
                                                    }
                                                } catch (error) {
                                                    console.error(error);
                                                    return res.status(500).json({
                                                        success: false,
                                                        message: "There is a server error",
                                                    });
                                                }
                                            };
                // API for create a demo event
                                                const create_DemoEvent = async (req, res) => {
                                                
                                                        try {
                                                        const adminId = req.params.adminId
                                                        const { title, description, event_Type, venue_Date_and_time } = req.body;
                                                    
                                                        const requiredFields = ['title', 'description', 'event_Type', 'venue_Date_and_time'];
                                                        for (const field of requiredFields) {
                                                            if (!req.body[field]) {
                                                            return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                                                            }
                                                        }
                                                            // check for admin 
                                                            const admin = await Admin.findOne({ _id : adminId })
                                                            if(!admin)
                                                            {
                                                            return res.status(400).json({ success : false , message : `admin not found`})
                                                            }
                                                                                
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
                                                            adminId : adminId,
                                                            event_status :  eventModel.schema.path('event_status').getDefault(),
                                                            
                                                        });
                                                    
                                                        const saveEvent = await newEvent.save();
                                                        res.status(200).json({
                                                            success: true,
                                                            message: 'Demo Event created successfully',
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
                                                
        // APi for get Demo event by admin Id
                                                const getDemoEvent = async (req ,res)=>{
                                                    try {
                                                    
                                                        // check for event
                                                        const event = await eventModel.find({
                                                            event_Type: 'Demo' 
                                                        })
                                                        return res.status(200).json({
                                                            success: true,
                                                            message: 'Events fetched successfully',
                                                            events: event,
                                                        });
                                                    } catch (error) {
                                                        return res.status(500).json({
                                                            success : false,
                                                            message: ' there is an server error '
                                                        })
                                                    }
                                                }   
               
                  

            // APi for get all guests of a collection  in bookMark model
                                        const getCollectionGuests = async (req ,res)=>{
                                            try {
                                                const collectionName = req.body.collectionName
                                                const query = {
                                                    collectionName
                                                }
                                                
                                                const guest = await bookmarkModel.find(query)

                                                if(!guest || guest.length === 0)
                                                {
                                                    return res.status(400).json({
                                                                        success : false ,
                                                                        message : `no guest found for the collection : ${collectionName}`
                                                    })
                                                }

                                                res.status(200).json({
                                                                    success : true,
                                                                    message : `All Guests for the collection : ${collectionName}`,
                                                                    all_guests : guest
                                                })
                                            } catch (error) {
                                                console.error(error);
                                                return res.status(500).json({
                                                                        success : false ,
                                                                        message : 'there is an server error'
                                                })
                                            }
                                        }

              // API for get all feedbacks of events 
                            const getFeedbacksofEvent = async (req , res )=>{
                                try {
                                    const eventId = req.params.eventId
                                    // check for event
                                    const event = await eventModel.findOne({ _id : eventId })
                                    if(!event)
                                    {
                                        return res.status(400).json({
                                                                success : false ,
                                                                message : ' event not found '
                                        })
                                    }
                                    // check for feedbacks
                                    const feedback = await feedbackModel.find({})
                                    if(!feedback)
                                    {
                                    return res.status(400).json({
                                                            success : false,
                                                            message : 'there is no feedback yet'
                                    })
                                    }
                                    else
                                    {
                                    return res.status(200).json({
                                                                success : true ,
                                                                message :`all feedbacks of event : ${eventId}`,
                                                                feedback_details : feedback                                                                
                                    })
                                    }

                                } catch (error) {
                                
                                return res.status(500).json({
                                                            success : false ,
                                                            message : ' there is an server error '
                                })
                                }
                            }
                                            
              // API for check and Toggle user event status
                  const checkAndToggleStatus = async (req ,res)=>{
                    try {
                        const eventId = req.params.eventId
                        // check for event existance
                   const event = await eventModel.findOne({ _id : eventId })
                   if(!event)
                   {
                    return res.status(400).json({ success : false , message : 'event not found'})
                   }
                   // toggle the event status

                   const currentStatus = event.event_status
                   const newStatus = 1 - currentStatus
                   event.event_status = newStatus
                      // save the update status in event
                       await event.save()
                      return res.status(200).json({
                                          success : true , 
                                          message : 'Event status changed successfully',
                                          
                      })
                    } catch (error) {
                        return res.status(500).json({
                                    success : false ,
                                    message : ' there is an server error '
                        })
                    }
                  }    
    // API for delete feedback of event by feedback Id
                            const deleteFeedback_OfEvent = async  (req , res)=>{
                                try {
                                       const {eventId , feedbackId } = req.params
                                       
                                       // check for event existance
                                    const event = await eventModel.findOne({ _id : eventId })
                                    if(!event)
                                     {
                                        return res.status(400).json({
                                                     success : false ,
                                                     message : 'event Not Found'
                                        })
                                     }
                                    
                            // check for feedback
                              const feedback  = await feedbackModel.findOne({
                                                            _id : feedbackId ,
                                                            eventId : eventId
                              })

                              if(!feedback)
                              {
                                return res.status(400).json({
                                                     success : false ,
                                                     message : `there is no feedback in event by the given feedbackId : ${feedbackId}`
                                })
                              }
                              else
                              {
                                      await feedbackModel.findByIdAndDelete(feedbackId)
                                      return res.status(200).json({
                                                         success : true ,
                                                         message : 'feedback deleted successfully'
                                      })
                              }
                                    
                                } catch (error) {
                                    return res.status(500).json({
                                                      success : false ,
                                                      message : 'server error'
                                    })
                                }
                            }      
        module.exports = { login_Admin  , changePassword , forgetPassToken , reset_password ,
                               changeProfile ,create_DemoEvent, getCollectionGuests , getFeedbacksofEvent ,
                                getAdmin , getDemoEvent , checkAndToggleStatus , deleteFeedback_OfEvent}