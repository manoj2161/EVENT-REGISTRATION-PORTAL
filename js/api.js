(function () {
  const STORAGE_KEY = "universityEventPortalData";
  const SESSION_KEY = "universityEventPortalSession";

  const departments = [
    "C.S.E - BCA",
    "C.S.E - B.Tech",
    "C.S.E - MCA",
    "C.S.E - BSc IT",
    "C.S.E - BSc CS",
    "Science - Physics",
    "Science - Chemistry",
    "Science - Maths",
    "Science - Zoology",
    "Law Department",
    "Pharmacy Department",
    "HM Department"
  ];

  const locations = ["Pragti Room", "MP Hall", "Ground"];

  const seedData = {
    events: [
      {
        id: "evt-1001",
        title: "Inter Department Tech Fest",
        organizer: "C.S.E Association",
        date: "2026-07-12",
        time: "10:00",
        location: "MP Hall",
        department: "C.S.E - B.Tech",
        departments: ["C.S.E - B.Tech", "C.S.E - BCA", "C.S.E - MCA"],
        seats: 120,
        description: "Coding contests, project showcases, quizzes, and student innovation demos.",
        status: "approved",
        createdBy: "organizer",
        createdAt: "2026-06-01T10:00:00.000Z"
      },
      {
        id: "evt-1002",
        title: "Science Exhibition",
        organizer: "Science Faculty",
        date: "2026-07-18",
        time: "11:30",
        location: "Ground",
        department: "Science - Physics",
        departments: ["Science - Physics", "Science - Chemistry", "Science - Maths", "Science - Zoology"],
        seats: 150,
        description: "Model presentations and experiments from physics, chemistry, maths, and zoology streams.",
        status: "approved",
        createdBy: "admin",
        createdAt: "2026-06-02T10:00:00.000Z"
      },
      {
        id: "evt-1003",
        title: "Hospitality Skills Workshop",
        organizer: "HM Department",
        date: "2026-07-22",
        time: "13:00",
        location: "Pragti Room",
        department: "HM Department",
        departments: ["HM Department"],
        seats: 60,
        description: "Hands-on workshop for hospitality service, guest handling, and event operations.",
        status: "pending",
        createdBy: "organizer",
        createdAt: "2026-06-03T10:00:00.000Z"
      }
    ],
    registrations: [],
    users: [
      {
        id: "user-student",
        name: "Demo Student",
        email: "student@university.edu",
        password: "password123",
        role: "student",
        createdAt: "2026-06-01T10:00:00.000Z"
      },
      {
        id: "user-organizer",
        name: "Demo Organizer",
        email: "organizer@university.edu",
        password: "password123",
        role: "organizer",
        createdAt: "2026-06-01T10:00:00.000Z"
      },
      {
        id: "user-admin-manoj",
        name: "Manoj",
        email: "thakurmanu065@gmail.com",
        password: "Manu@2621",
        role: "admin",
        createdAt: "2026-06-01T10:00:00.000Z"
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return clone(seedData);
    }

    try {
      const data = JSON.parse(saved);
      if (!Array.isArray(data.users)) {
        data.users = clone(seedData.users);
      }
      data.users = normalizeUsers(data.users);
      data.events = normalizeEvents(data.events || []);
      saveData(data);
      return data;
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return clone(seedData);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return clone(data);
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function normalizeUsers(users) {
    const nonAdminUsers = users.filter((user) => user.role !== "admin");
    const adminUser = clone(seedData.users.find((user) => user.role === "admin"));
    return [...nonAdminUsers, adminUser];
  }

  function normalizeEvents(events) {
    return events.map((event) => ({
      ...event,
      departments: Array.isArray(event.departments) && event.departments.length
        ? event.departments
        : [event.department].filter(Boolean)
    }));
  }

  function getEvents() {
    return loadData().events;
  }

  function getRegistrations() {
    return loadData().registrations;
  }

  function getPublicUser(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  function signup(userInput) {
    const data = loadData();
    if (userInput.role === "admin") {
      throw new Error("Admin signup is disabled. Please use the official admin login.");
    }

    const email = userInput.email.toLowerCase();
    const existingUser = data.users.find((user) => user.email.toLowerCase() === email);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const user = {
      id: makeId("user"),
      name: userInput.name,
      email,
      password: userInput.password,
      role: userInput.role,
      createdAt: new Date().toISOString()
    };

    data.users.push(user);
    saveData(data);
    localStorage.setItem(SESSION_KEY, user.id);
    return getPublicUser(user);
  }

  function login(email, password) {
    const data = loadData();
    const user = data.users.find((item) => {
      return item.email.toLowerCase() === email.toLowerCase() && item.password === password;
    });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    localStorage.setItem(SESSION_KEY, user.id);
    return getPublicUser(user);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) {
      return null;
    }

    const user = loadData().users.find((item) => item.id === userId);
    return getPublicUser(user);
  }

  function createEvent(eventInput) {
    const data = loadData();
    const eventDepartments = Array.isArray(eventInput.departments) && eventInput.departments.length
      ? eventInput.departments
      : [eventInput.department].filter(Boolean);

    const event = {
      id: makeId("evt"),
      ...eventInput,
      department: eventDepartments[0],
      departments: eventDepartments,
      seats: Number(eventInput.seats),
      createdAt: new Date().toISOString()
    };

    data.events.unshift(event);
    saveData(data);
    return event;
  }

  function updateEventStatus(eventId, status) {
    const data = loadData();
    const event = data.events.find((item) => item.id === eventId);
    if (!event) {
      throw new Error("Event not found.");
    }

    event.status = status;
    saveData(data);
    return event;
  }

  function deleteEvent(eventId) {
    const data = loadData();
    data.events = data.events.filter((event) => event.id !== eventId);
    data.registrations = data.registrations.filter((registration) => registration.eventId !== eventId);
    saveData(data);
  }

  function registerStudent(registrationInput) {
    const data = loadData();
    const event = data.events.find((item) => item.id === registrationInput.eventId);
    if (!event || event.status !== "approved") {
      throw new Error("This event is not available for registration.");
    }

    if (!event.departments.includes(registrationInput.department)) {
      throw new Error("Your department is not eligible for this event.");
    }

    const takenSeats = data.registrations.filter((item) => item.eventId === event.id).length;
    if (takenSeats >= event.seats) {
      throw new Error("All seats are filled for this event.");
    }

    const alreadyRegistered = data.registrations.some((item) => {
      const sameEvent = item.eventId === event.id;
      const sameRoll = item.rollNo.toUpperCase() === registrationInput.rollNo.toUpperCase();
      const sameEmail = item.email.toLowerCase() === registrationInput.email.toLowerCase();
      const sameAccount = item.studentUserId && item.studentUserId === registrationInput.studentUserId;
      return sameEvent && (sameRoll || sameEmail || sameAccount);
    });

    if (alreadyRegistered) {
      throw new Error("This student is already registered for the selected event.");
    }

    const registration = {
      id: makeId("reg"),
      ...registrationInput,
      rollNo: registrationInput.rollNo.toUpperCase(),
      registeredAt: new Date().toISOString()
    };

    data.registrations.unshift(registration);
    saveData(data);
    return registration;
  }

  function updateRegistration(registrationId, registrationInput) {
    const data = loadData();
    const registration = data.registrations.find((item) => item.id === registrationId);
    if (!registration) {
      throw new Error("Registration not found.");
    }

    const event = data.events.find((item) => item.id === registration.eventId);
    if (!event || !event.departments.includes(registrationInput.department)) {
      throw new Error("Your department is not eligible for this event.");
    }

    const duplicate = data.registrations.some((item) => {
      if (item.id === registrationId || item.eventId !== registration.eventId) {
        return false;
      }

      const sameRoll = item.rollNo.toUpperCase() === registrationInput.rollNo.toUpperCase();
      const sameEmail = item.email.toLowerCase() === registrationInput.email.toLowerCase();
      return sameRoll || sameEmail;
    });

    if (duplicate) {
      throw new Error("Another student already uses this roll number or email for the selected event.");
    }

    Object.assign(registration, {
      name: registrationInput.name,
      rollNo: registrationInput.rollNo.toUpperCase(),
      phone: registrationInput.phone,
      email: registrationInput.email,
      department: registrationInput.department,
      updatedAt: new Date().toISOString()
    });

    saveData(data);
    return registration;
  }

  function cancelRegistration(registrationId) {
    const data = loadData();
    data.registrations = data.registrations.filter((registration) => registration.id !== registrationId);
    saveData(data);
  }

  function resetDemoData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    localStorage.removeItem(SESSION_KEY);
    return clone(seedData);
  }

  window.PortalAPI = {
    departments,
    locations,
    getEvents,
    getRegistrations,
    signup,
    login,
    logout,
    getCurrentUser,
    createEvent,
    updateEventStatus,
    deleteEvent,
    registerStudent,
    updateRegistration,
    cancelRegistration,
    resetDemoData
  };
})();
