const dotenv = require('dotenv')
dotenv.config();

const AfricasTalking = require('africastalking');

const credentials = {
    apiKey: process.env.AT_LIVE_SMS_API_KEY,
    username: process.env.AT_SMS_USERNAME,
}
console.log("api key: ", credentials.apiKey)
// Initialize the SDK
const africastalking = AfricasTalking(credentials);

// Initialize the SDK


// Get the SMS service
const sms = africastalking.SMS;

const sendMessage = async (phoneNumber, message) => {
    try {
        const options = {
            to: [phoneNumber], // Array of recipients
            message: message,
            // from: '13017' // Optional sender ID
        };

        console.log('Sending SMS with options:', options);
        
        // Send SMS and wait for response
        const response = await sms.send(options);
        console.log('SMS sent successfully:', response);
        
        return response;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        throw error; // Re-throw for handling in the calling function
    }
};

module.exports = sendMessage;