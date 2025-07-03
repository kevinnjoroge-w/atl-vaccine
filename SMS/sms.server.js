const express = require('express');
const sendSMS = require('./send-sms');
const bodyParser = require('body-parser');

const app = express();

// Initialize the server
function initializeSmsServer() {
    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // atsk_30e407466b8abb1ddbba1750a725a3acdff30fbbc99e337d3ba00e16494c8d9bf335b887 : live
    // atsk_34e1667902dc041f970b4ac73f1f00045abfcea3b85d9ce5e434a20930d4128407cb0d8 : sandbox

    // Endpoint to send SMS
    app.post('/send-sms', async (req, res) => {
        console.log("Top of sending an sms: ")
        try {
            const { phoneNumber, message } = req.body;
            console.log(phoneNumber,message, "The details:")
            // console.log(req.body, "The body:")
            
            if (!phoneNumber || !message) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Phone number and message are required' 
                });
            }

            const result = await sendSMS(phoneNumber, message);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error sending SMS:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to send SMS'
            });
        }
    });

    // Endpoint for incoming messages
    app.post('/incoming-messages', (req, res) => {
        try {
            console.log('Received SMS:', req.body);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error processing incoming message:', error);
            res.sendStatus(500);
        }
    });

    // Endpoint for delivery reports
    app.post('/delivery-reports', (req, res) => {
        try {
            console.log('Delivery Report:', req.body);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error processing delivery report:', error);
            res.sendStatus(500);
        }
    });

    const port = process.env.SMS_SERVER_PORT || 3001;
    const server = app.listen(port, () => {
        console.log(`SMS Server running on port ${port}`);
    });

    return server;
}

// Execute the function immediately when this file is run directly
if (require.main === module) {
    initializeSmsServer();
}

module.exports = initializeSmsServer;