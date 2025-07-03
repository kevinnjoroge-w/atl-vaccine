const express = require("express");
const dotenv = require("dotenv");
const UssdMenu = require("ussd-menu-builder");

const app = express();
dotenv.config();
const menu = new UssdMenu();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test", (req, res) => {
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
        menu.con("Please enter your birth cerficate number or id number:");
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
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Id: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.con("Please choose a vaccine:\n\n1. BCG\n2. Polio. \n3. Measles. \n4. Malaria. \n5. DPT. \n6 Typhoid");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "BCG",
    2: "Polio",
    3: "Measles",
    4: "Malaria",
    5: "DPT",
    6: "Typhoid"
  },
});

menu.state("BCG", {
  run: () => {
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Id: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.con("Please choose a vaccination period::\n\n1. In 3 days. \n2. In 7 days. \n3. In 10 days. \n4. In 14 days");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "In 3 days",
    2: "In 7 days",
    3: "In 10 days",
    4: "In 14 days"    
  },
});

menu.state("In 3 days", {
  run: () => {
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Id: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.con("Would you like to receive an sms with more information about the vaccine?:\n\n1. Yes. \n2. No");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  },
  next: {
    1: "Yes",
    2: "No",      
  },
});

menu.state("Yes", {
  run: () => {
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Id: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.end("You will recieve an sms shortly with the vaccination date and more info");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
  }
});

menu.state("No", {
  run: () => {
    const location = menu.val;
    if (!location || location.trim() === "") {
      return menu.end("Invalid location. Please try again.");
    }
    console.log("User Id: ", location);

    menu.session
      .set("location", location.trim())
      .then(() => {
        menu.end("You will recieve an sms shortly with the vaccination date. Thankyou for using Chanjo!");
      })
      .catch((err) => {
        console.error("Session error:", err);
        menu.end("System error. Please try again.");
      });
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
