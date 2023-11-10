const cors = require('cors')
const upload = require('../utils/uploads')
const fs = require('fs')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const eventModel = require('../models/eventModel')
const Admin = require('../models/AdminModel')
const bcrypt = require('bcrypt')
const tokenModel = require('../models/tokenModel')
const sendEmails = require('../utils/sendEmails')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
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

           const link = `${process.env.BASE_URL}`
           await sendEmails(admin.email, "Password reset", link)

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
                                       
        module.exports = { login_Admin  , changePassword , forgetPassToken , reset_password}