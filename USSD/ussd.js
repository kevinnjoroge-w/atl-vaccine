const express = require('express');
const dotenv = require("dotenv");
const UssdMenu = require("ussd-menu-builder");

const app = express();
dotenv.config();
const menu = new UssdMenu();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/test', (req, res) => {
    res.send("USSD Server is running");
});

const sessions = {};

// Proper session configuration with promise support
menu.sessionConfig({
    start: (sessionId) => {
        return new Promise((resolve) => {
            if (!sessions[sessionId]) sessions[sessionId] = {};
            resolve();
        });
    },
    end: (sessionId) => {
        return new Promise((resolve) => {
            delete sessions[sessionId];
            resolve();
        });
    },
    get: (sessionId) => {
        return new Promise((resolve) => {
            resolve(sessions[sessionId] || {});
        });
    },
    set: (sessionId, sessionData) => {
        return new Promise((resolve) => {
            sessions[sessionId] = sessionData;
            resolve();
        });
    }
});

// USSD Menu Configuration
menu.startState({
    run: () => {
        menu.con('Welcome to Chanjo\n\n1. Register\n2. Exit');
    },
    next: {
        '1': 'register',
        '2': 'exit'
    }
});


// USSD Endpoint
app.post('/api/ussd', (req, res) => {
    menu.run(req.body)
        .then(ussdResult => {
            res.send(ussdResult);
        })
        .catch(err => {
            console.error('USSD Processing Error:', err);
            res.send('END System error. Please try again.');
        });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`USSD server running on port ${port}`);
});