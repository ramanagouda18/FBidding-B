const User=require('../models/user-model')
require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID
const authToken =process.env.AUTHTOKEN
const client = require('twilio')(accountSid, authToken);
const otpCtrl={}
const generateOtp=()=>{
    return Math.floor(100000 + Math.random() * 900000);
}
otpCtrl.create=async(req, res) => {
    const { phone } = req.body;
    try{
        const user = await User.findOne({phone})
        if(user){
        const otp = generateOtp();
        user.otp = otp
        await user.save()
        // Send OTP to the provided phone number using Twilio
        client.messages.create({
        body:`Your OTP is: ${otp}`,
        from:process.env.FROM,
        to:process.env.TO
        })
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
        }
        else{
            res.json({message:'User Not found'})
        }
    }
    catch(err){
    console.error('Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
    };
}
// Route to handle OTP verification
otpCtrl.verify=async(req, res) => {
    const { phone, otp } = req.body;
    try{
        const user = await User.find({phone})
        if(user){
            // Compare OTP entered by the user with the generated OTP
            if (user.otp === otp) {
                res.status(200).json({ success: true, message: 'OTP verification successful' });
            } else {
                res.status(400).json({ success: false, message: 'Incorrect OTP' });
            }
        }
    }catch(error){
        console.log(error)
        res.status(500).json({error:"Internal Server Errors"})
    }
};
module.exports=otpCtrl
