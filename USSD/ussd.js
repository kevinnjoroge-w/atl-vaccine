const express = require("express");
const dotenv = require("dotenv");
const UssdMenu = require("ussd-menu-builder");
const axios = require("axios"); // ADDED: For HTTP requests

const app = express();
dotenv.config();
const menu = new UssdMenu();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test", (req, res) => {
  res.send("USSD Server is running");
});

const sessions = {};

// ADDED: Hardcoded personalized messages for each vaccine
const vaccineMessages = {
  "BCG": {
    "3": {
      info: "BCG Vaccine Information:\n\n🩹 Protects against tuberculosis (TB)\n💉 Given at birth or within first few months\n⚠️ May cause small scar at injection site\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your ID and birth certificate",
      reminder: "🔔 BCG Vaccination Reminder\n\nHello! Your BCG vaccination is scheduled for 3 days from now. This vaccine protects against tuberculosis. Please bring your ID and birth certificate. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "BCG Vaccine Information:\n\n🩹 Protects against tuberculosis (TB)\n💉 Given at birth or within first few months\n⚠️ May cause small scar at injection site\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your ID and birth certificate",
      reminder: "🔔 BCG Vaccination Reminder\n\nHello! Your BCG vaccination is scheduled for 7 days from now. This vaccine protects against tuberculosis. Please bring your ID and birth certificate. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "BCG Vaccine Information:\n\n🩹 Protects against tuberculosis (TB)\n💉 Given at birth or within first few months\n⚠️ May cause small scar at injection site\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your ID and birth certificate",
      reminder: "🔔 BCG Vaccination Reminder\n\nHello! Your BCG vaccination is scheduled for 10 days from now. This vaccine protects against tuberculosis. Please bring your ID and birth certificate. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "BCG Vaccine Information:\n\n🩹 Protects against tuberculosis (TB)\n💉 Given at birth or within first few months\n⚠️ May cause small scar at injection site\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your ID and birth certificate",
      reminder: "🔔 BCG Vaccination Reminder\n\nHello! Your BCG vaccination is scheduled for 14 days from now. This vaccine protects against tuberculosis. Please bring your ID and birth certificate. Arrive 30 minutes early at your nearest health center."
    }
  },
  "Polio": {
    "3": {
      info: "Polio Vaccine Information:\n\n🦠 Protects against poliomyelitis\n💧 Given as oral drops or injection\n🔄 Multiple doses needed for full protection\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination card",
      reminder: "🔔 Polio Vaccination Reminder\n\nHello! Your Polio vaccination is scheduled for 3 days from now. This vaccine prevents poliomyelitis. Please bring your vaccination card. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "Polio Vaccine Information:\n\n🦠 Protects against poliomyelitis\n💧 Given as oral drops or injection\n🔄 Multiple doses needed for full protection\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination card",
      reminder: "🔔 Polio Vaccination Reminder\n\nHello! Your Polio vaccination is scheduled for 7 days from now. This vaccine prevents poliomyelitis. Please bring your vaccination card. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "Polio Vaccine Information:\n\n🦠 Protects against poliomyelitis\n💧 Given as oral drops or injection\n🔄 Multiple doses needed for full protection\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination card",
      reminder: "🔔 Polio Vaccination Reminder\n\nHello! Your Polio vaccination is scheduled for 10 days from now. This vaccine prevents poliomyelitis. Please bring your vaccination card. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "Polio Vaccine Information:\n\n🦠 Protects against poliomyelitis\n💧 Given as oral drops or injection\n🔄 Multiple doses needed for full protection\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination card",
      reminder: "🔔 Polio Vaccination Reminder\n\nHello! Your Polio vaccination is scheduled for 14 days from now. This vaccine prevents poliomyelitis. Please bring your vaccination card. Arrive 30 minutes early at your nearest health center."
    }
  },
  "Measles": {
    "3": {
      info: "Measles Vaccine Information:\n\n🔴 Protects against measles, mumps, rubella (MMR)\n💉 Usually given at 9-12 months\n🌡️ May cause mild fever after vaccination\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your child's health card",
      reminder: "🔔 Measles Vaccination Reminder\n\nHello! Your Measles vaccination is scheduled for 3 days from now. This vaccine protects against measles, mumps, and rubella. Please bring your child's health card. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "Measles Vaccine Information:\n\n🔴 Protects against measles, mumps, rubella (MMR)\n💉 Usually given at 9-12 months\n🌡️ May cause mild fever after vaccination\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your child's health card",
      reminder: "🔔 Measles Vaccination Reminder\n\nHello! Your Measles vaccination is scheduled for 7 days from now. This vaccine protects against measles, mumps, and rubella. Please bring your child's health card. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "Measles Vaccine Information:\n\n🔴 Protects against measles, mumps, rubella (MMR)\n💉 Usually given at 9-12 months\n🌡️ May cause mild fever after vaccination\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your child's health card",
      reminder: "🔔 Measles Vaccination Reminder\n\nHello! Your Measles vaccination is scheduled for 10 days from now. This vaccine protects against measles, mumps, and rubella. Please bring your child's health card. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "Measles Vaccine Information:\n\n🔴 Protects against measles, mumps, rubella (MMR)\n💉 Usually given at 9-12 months\n🌡️ May cause mild fever after vaccination\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your child's health card",
      reminder: "🔔 Measles Vaccination Reminder\n\nHello! Your Measles vaccination is scheduled for 14 days from now. This vaccine protects against measles, mumps, and rubella. Please bring your child's health card. Arrive 30 minutes early at your nearest health center."
    }
  },
  "Malaria": {
    "3": {
      info: "Malaria Vaccine Information:\n\n🦟 Protects against malaria (RTS,S/AS01)\n💉 Given in 4 doses starting at 5 months\n🛡️ Provides partial protection against malaria\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Malaria Vaccination Reminder\n\nHello! Your Malaria vaccination is scheduled for 3 days from now. This vaccine provides protection against malaria. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "Malaria Vaccine Information:\n\n🦟 Protects against malaria (RTS,S/AS01)\n💉 Given in 4 doses starting at 5 months\n🛡️ Provides partial protection against malaria\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Malaria Vaccination Reminder\n\nHello! Your Malaria vaccination is scheduled for 7 days from now. This vaccine provides protection against malaria. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "Malaria Vaccine Information:\n\n🦟 Protects against malaria (RTS,S/AS01)\n💉 Given in 4 doses starting at 5 months\n🛡️ Provides partial protection against malaria\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Malaria Vaccination Reminder\n\nHello! Your Malaria vaccination is scheduled for 10 days from now. This vaccine provides protection against malaria. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "Malaria Vaccine Information:\n\n🦟 Protects against malaria (RTS,S/AS01)\n💉 Given in 4 doses starting at 5 months\n🛡️ Provides partial protection against malaria\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Malaria Vaccination Reminder\n\nHello! Your Malaria vaccination is scheduled for 14 days from now. This vaccine provides protection against malaria. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    }
  },
  "DPT": {
    "3": {
      info: "DPT Vaccine Information:\n\n🦠 Protects against Diphtheria, Pertussis, Tetanus\n💉 Given in multiple doses (6, 10, 14 weeks)\n🔄 Booster shots needed later\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your immunization card",
      reminder: "🔔 DPT Vaccination Reminder\n\nHello! Your DPT vaccination is scheduled for 3 days from now. This vaccine protects against Diphtheria, Pertussis, and Tetanus. Please bring your immunization card. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "DPT Vaccine Information:\n\n🦠 Protects against Diphtheria, Pertussis, Tetanus\n💉 Given in multiple doses (6, 10, 14 weeks)\n🔄 Booster shots needed later\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your immunization card",
      reminder: "🔔 DPT Vaccination Reminder\n\nHello! Your DPT vaccination is scheduled for 7 days from now. This vaccine protects against Diphtheria, Pertussis, and Tetanus. Please bring your immunization card. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "DPT Vaccine Information:\n\n🦠 Protects against Diphtheria, Pertussis, Tetanus\n💉 Given in multiple doses (6, 10, 14 weeks)\n🔄 Booster shots needed later\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your immunization card",
      reminder: "🔔 DPT Vaccination Reminder\n\nHello! Your DPT vaccination is scheduled for 10 days from now. This vaccine protects against Diphtheria, Pertussis, and Tetanus. Please bring your immunization card. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "DPT Vaccine Information:\n\n🦠 Protects against Diphtheria, Pertussis, Tetanus\n💉 Given in multiple doses (6, 10, 14 weeks)\n🔄 Booster shots needed later\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your immunization card",
      reminder: "🔔 DPT Vaccination Reminder\n\nHello! Your DPT vaccination is scheduled for 14 days from now. This vaccine protects against Diphtheria, Pertussis, and Tetanus. Please bring your immunization card. Arrive 30 minutes early at your nearest health center."
    }
  },
  "Typhoid": {
    "3": {
      info: "Typhoid Vaccine Information:\n\n🦠 Protects against typhoid fever\n💉 Given as injection or oral capsules\n🛡️ Effective for 2-3 years\n📅 Your appointment: 3 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Typhoid Vaccination Reminder\n\nHello! Your Typhoid vaccination is scheduled for 3 days from now. This vaccine protects against typhoid fever. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "7": {
      info: "Typhoid Vaccine Information:\n\n🦠 Protects against typhoid fever\n💉 Given as injection or oral capsules\n🛡️ Effective for 2-3 years\n📅 Your appointment: 7 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Typhoid Vaccination Reminder\n\nHello! Your Typhoid vaccination is scheduled for 7 days from now. This vaccine protects against typhoid fever. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "10": {
      info: "Typhoid Vaccine Information:\n\n🦠 Protects against typhoid fever\n💉 Given as injection or oral capsules\n🛡️ Effective for 2-3 years\n📅 Your appointment: 10 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Typhoid Vaccination Reminder\n\nHello! Your Typhoid vaccination is scheduled for 10 days from now. This vaccine protects against typhoid fever. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    },
    "14": {
      info: "Typhoid Vaccine Information:\n\n🦠 Protects against typhoid fever\n💉 Given as injection or oral capsules\n🛡️ Effective for 2-3 years\n📅 Your appointment: 14 days from now\n🏥 Visit your nearest health center\n\n⏰ Arrive 30 minutes early\n📋 Bring your vaccination record",
      reminder: "🔔 Typhoid Vaccination Reminder\n\nHello! Your Typhoid vaccination is scheduled for 14 days from now. This vaccine protects against typhoid fever. Please bring your vaccination record. Arrive 30 minutes early at your nearest health center."
    }
  }
};

// ADDED: Function to send SMS
async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post('https://6fc2-41-139-168-163.ngrok-free.app/send-sms', {
      phoneNumber: phoneNumber,
      message: message
    });
    console.log('SMS sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return false;
  }
}

// ADDED: Function to get personalized message
function getPersonalizedMessage(vaccine, duration, messageType) {
  const durationKey = duration.replace(/\D/g, ''); // Extract number from duration
  
  if (vaccineMessages[vaccine] && vaccineMessages[vaccine][durationKey]) {
    return vaccineMessages[vaccine][durationKey][messageType];
  }
  
  // Fallback message
  return `Your ${vaccine} vaccination is scheduled for ${duration}. Please visit your nearest health center with your documents.`;
}

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
  },
});

// USSD Menu Configuration
menu.startState({
  run: () => {
    menu.con("Welcome to Chanjo\n\n1. Register For Vaccination\n2. Exit");
  },
  next: {
    1: "register",
    2: "exit",
  },
});

menu.state("register", {
  run: () => {
    menu.con("Please enter your full name:");
  },
  next: {
    "*": "processName",
  },
});

menu.state("processName", {
  run: () => {
    const name = menu.val;
    if (!name || name.trim() === "") {
      return menu.end("Invalid name. Please try again.");
    }
    console.log("User: ", name);

    menu.session
      .set("fullName", name.trim())
      .then(() => {
        menu.con("Please enter your phone number:"); // MODIFIED: Changed from county to phone number
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    "*": "processPhone", // MODIFIED: Changed from processLocation to processPhone
  },
});

// ADDED: New state to process phone number
menu.state("processPhone", {
  run: () => {
    const phone = menu.val;
    if (!phone || phone.trim() === "") {
      return menu.end("Invalid phone number. Please try again.");
    }
    
    // Basic phone validation
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      return menu.end("Please enter a valid phone number.");
    }
    
    console.log("User Phone: ", cleanPhone);

    menu.session
      .set("phoneNumber", cleanPhone)
      .then(() => {
        menu.con("Please enter your current county:");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    "*": "processLocation",
  },
});

menu.state("processLocation", {
  run: () => {
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Location: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.con("Please enter your birth certificate number or ID number:");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    "*": "processId",
  },
});

menu.state("processId", {
  run: () => {
    const id = menu.val;
    if (!id || id.trim() === "") {
      return menu.end("Invalid ID. Please try again."); // FIXED: Changed error message
    }
    console.log("User Id: ", id);

    menu.session
      .set("id", id)
      .then(() => {
        menu.con("Please choose a vaccine:\n\n1. BCG\n2. Polio\n3. Measles\n4. Malaria\n5. DPT\n6. Typhoid"); // FIXED: Added period after 6
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "vaccineSelected",
    2: "vaccineSelected",
    3: "vaccineSelected",
    4: "vaccineSelected",
    5: "vaccineSelected",
    6: "vaccineSelected"
  },
});

// MODIFIED: Consolidated vaccine selection into one state
menu.state("vaccineSelected", {
  run: () => {
    const vaccineOption = menu.val;
    const vaccineMap = {
      "1": "BCG",
      "2": "Polio",
      "3": "Measles",
      "4": "Malaria",
      "5": "DPT",
      "6": "Typhoid"
    };
    
    const selectedVaccine = vaccineMap[vaccineOption];
    
    if (!selectedVaccine) {
      return menu.end("Invalid vaccine selection. Please try again.");
    }
    
    console.log("Selected Vaccine: ", selectedVaccine);

    menu.session
      .set("vaccine", selectedVaccine)
      .then(() => {
        menu.con("Please choose a vaccination period:\n\n1. In 3 days\n2. In 7 days\n3. In 10 days\n4. In 14 days");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "durationSelected",
    2: "durationSelected",
    3: "durationSelected",
    4: "durationSelected"
  },
});

// MODIFIED: Consolidated duration selection into one state
menu.state("durationSelected", {
  run: () => {
    const durationOption = menu.val;
    const durationMap = {
      "1": "In 3 days",
      "2": "In 7 days",
      "3": "In 10 days",
      "4": "In 14 days"
    };
    
    const selectedDuration = durationMap[durationOption];
    
    if (!selectedDuration) {
      return menu.end("Invalid duration selection. Please try again.");
    }
    
    console.log("Selected Duration: ", selectedDuration);

    menu.session
      .set("duration", selectedDuration)
      .then(() => {
        menu.con("Would you like to receive an SMS with more information about the vaccine?\n\n1. Yes\n2. No");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "sendDetailedSMS",
    2: "sendBasicSMS"
  },
});

// MODIFIED: Send detailed SMS with vaccine information
menu.state("sendDetailedSMS", {
  run: async () => {
    try {
      console.log("I am here.....")  
      const sessionData = await menu.session.get();
      console.log("I am here at data.....", sessionData) 
      const { phoneNumber, vaccine, duration, fullName } = sessionData;
      
      if (!phoneNumber || !vaccine || !duration) {
        return menu.end("Session data missing. Please try again.");
      }
      
      // Get personalized message
      const message = getPersonalizedMessage(vaccine, duration, 'info');
      
      // Send SMS
      const smsSent = await sendSMS(phoneNumber, message);
      
      if (smsSent) {
        console.log(`Detailed SMS sent to ${phoneNumber} for ${vaccine} vaccine`);
        menu.end(`Thank you ${fullName}! You will receive a detailed SMS shortly with your ${vaccine} vaccination information and appointment details.`);
      } else {
        menu.end("Registration successful, but SMS could not be sent. Please contact the health center directly.");
      }
    } catch (error) {
      console.error("Error in sendDetailedSMS:", error);
      menu.end("System error. Please try again.");
    }
  }
});

// MODIFIED: Send basic SMS with reminder only
menu.state("sendBasicSMS", {
  run: async () => {
    try {
      const sessionData = await menu.session.get();
      const { phoneNumber, vaccine, duration, fullName } = sessionData;
      
      if (!phoneNumber || !vaccine || !duration) {
        return menu.end("Session data missing. Please try again.");
      }
      
      // Get personalized reminder message
      const message = getPersonalizedMessage(vaccine, duration, 'reminder');
      
      // Send SMS
      const smsSent = await sendSMS(phoneNumber, message);
      
      if (smsSent) {
        console.log(`Basic SMS sent to ${phoneNumber} for ${vaccine} vaccine`);
        menu.end(`Thank you ${fullName}! You will receive an SMS reminder shortly with your ${vaccine} vaccination date. Thank you for using Chanjo!`);
      } else {
        menu.end("Registration successful, but SMS could not be sent. Please contact the health center directly.");
      }
    } catch (error) {
      console.error("Error in sendBasicSMS:", error);
      menu.end("System error. Please try again.");
    }
  }
});

// ADDED: Exit state
menu.state("exit", {
  run: () => {
    menu.end("Thank you for using Chanjo. Stay healthy!");
  }
});

// USSD Endpoint
app.post("/api/ussd", (req, res) => {
  menu
    .run(req.body)
    .then((ussdResult) => {
      res.send(ussdResult);
    })
    .catch((err) => {
      console.error("USSD Processing Error:", err);
      res.send("END System error. Please try again.");
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`USSD server running on port ${port}`);
});