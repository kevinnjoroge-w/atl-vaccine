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

function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Kenyan numbers: 07... or 7... becomes +254...
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+254' + cleaned.substring(1);
  } 
  else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '+254' + cleaned;
  }
  // Handle 254... format
  else if (cleaned.startsWith('254') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  // Return as is if already in +254 format
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

const sendMessage = async (phoneNumber, message) => {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);

        const options = {
            to: [formattedPhone], // Array of recipients
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