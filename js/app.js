const api = window.PortalAPI;

const page = document.body.dataset.page;
const state = {
  currentUser: null,
  eventSearch: "",
  locationFilter: "",
  departmentFilter: "",
  adminStatusFilter: "",
  registrationSearch: ""
};

const rolePages = {
  student: "student.html",
  organizer: "organizer.html",
  admin: "admin.html"
};

function init() {
  state.currentUser = api.getCurrentUser();
  bindCommonEvents();

  if (page === "auth") {
    bindAuthPage();
    redirectLoggedInUser();
    return;
  }

  protectRolePage();
  fillSelectOptions();
  setDefaultDates();
  bindPanelPage();
  renderAll();
}

function bindCommonEvents() {
  const logoutBtn = document.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      api.logout();
      window.location.href = "index.html";
    });
  }
}

function bindAuthPage() {
  document.querySelectorAll(".auth-mode").forEach((button) => {
    button.addEventListener("click", () => switchAuthMode(button.dataset.authMode));
  });

  document.querySelector("#loginForm").addEventListener("submit", handleLogin);
  document.querySelector("#signupForm").addEventListener("submit", handleSignup);

}

function bindPanelPage() {
  setSessionName();

  if (page === "student") {
    on("#studentSearch", "input", (event) => {
      state.eventSearch = event.target.value.trim().toLowerCase();
      renderStudentEvents();
    });

    on("#studentLocationFilter", "change", (event) => {
      state.locationFilter = event.target.value;
      renderStudentEvents();
    });

    on("#studentDepartmentFilter", "change", (event) => {
      state.departmentFilter = event.target.value;
      renderStudentEvents();
    });

    on("#closeRegistration", "click", () => {
      resetRegistrationForm();
    });

    on("#registrationForm", "submit", handleRegistration);
  }

  if (page === "organizer") {
    on("#organizerEventForm", "submit", handleOrganizerEvent);
    on("#clearOrganizerDrafts", "click", resetDemoData);
  }

  if (page === "admin") {
    on("#adminEventForm", "submit", handleAdminEvent);
    on("#adminStatusFilter", "change", (event) => {
      state.adminStatusFilter = event.target.value;
      renderAdminEvents();
    });
    on("#registrationSearch", "input", (event) => {
      state.registrationSearch = event.target.value.trim().toLowerCase();
      renderRegistrations();
    });
    on("#exportRegistrations", "click", exportRegistrationsCsv);
  }
}

function protectRolePage() {
  if (!state.currentUser) {
    window.location.href = "index.html";
    return;
  }

  if (state.currentUser.role !== page) {
    window.location.href = rolePages[state.currentUser.role] || "index.html";
  }
}

function redirectLoggedInUser() {
  if (state.currentUser) {
    window.location.href = rolePages[state.currentUser.role] || "student.html";
  }
}

function switchAuthMode(mode) {
  document.querySelectorAll(".auth-mode").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });

  document.querySelector("#loginForm").classList.toggle("hidden", mode !== "login");
  document.querySelector("#signupForm").classList.toggle("hidden", mode !== "signup");
}

function handleLogin(event) {
  event.preventDefault();

  try {
    const user = api.login(value("#loginEmail"), value("#loginPassword"));
    window.location.href = rolePages[user.role] || "student.html";
  } catch (error) {
    showToast(error.message);
  }
}

function handleSignup(event) {
  event.preventDefault();

  try {
    const password = value("#signupPassword");
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    const user = api.signup({
      name: value("#signupName"),
      email: value("#signupEmail"),
      password,
      role: value("#signupRole")
    });

    window.location.href = rolePages[user.role] || "student.html";
  } catch (error) {
    showToast(error.message);
  }
}

function fillSelectOptions() {
  fillDepartmentSelect("#studentDepartment", false);
  fillDepartmentSelect("#studentDepartmentFilter", true);
  fillDepartmentSelect("#orgEventDepartment", false);
  fillDepartmentSelect("#adminEventDepartment", false);

  fillLocationSelect("#studentLocationFilter", true);
  fillLocationSelect("#orgEventLocation", false);
  fillLocationSelect("#adminEventLocation", false);
}

function fillDepartmentSelect(selector, withAllOption) {
  const select = document.querySelector(selector);
  if (!select) {
    return;
  }

  select.innerHTML = withAllOption ? '<option value="">All departments</option>' : "";
  api.departments.forEach((department) => {
    select.appendChild(new Option(department, department));
  });
}

function fillLocationSelect(selector, withAllOption) {
  const select = document.querySelector(selector);
  if (!select) {
    return;
  }

  select.innerHTML = withAllOption ? '<option value="">All locations</option>' : "";
  api.locations.forEach((location) => {
    select.appendChild(new Option(location, location));
  });
}

function renderAll() {
  renderStats();

  if (page === "student") {
    renderStudentEvents();
    renderStudentRegistrations();
  }

  if (page === "organizer") {
    renderOrganizerEvents();
  }

  if (page === "admin") {
    renderAdminEvents();
    renderRegistrations();
  }
}

function renderStats() {
  const events = api.getEvents();
  const registrations = api.getRegistrations();
  const approvedEvents = events.filter((event) => event.status === "approved");
  const openSeats = approvedEvents.reduce((total, event) => total + getRemainingSeats(event), 0);

  setText("#heroEvents", approvedEvents.length);
  setText("#heroRegistrations", registrations.length);
  setText("#heroDepartments", api.departments.length);
  setText("#totalEvents", events.length);
  setText("#pendingEvents", events.filter((event) => event.status === "pending").length);
  setText("#totalRegistrations", registrations.length);
  setText("#availableSeats", openSeats);
}

function renderStudentEvents() {
  const eventList = document.querySelector("#eventList");
  const events = api.getEvents()
    .filter((event) => event.status === "approved")
    .filter((event) => {
      const text = `${event.title} ${event.organizer} ${event.description}`.toLowerCase();
      const matchesSearch = !state.eventSearch || text.includes(state.eventSearch);
      const matchesLocation = !state.locationFilter || event.location === state.locationFilter;
      const matchesDepartment = !state.departmentFilter || getEventDepartments(event).includes(state.departmentFilter);
      return matchesSearch && matchesLocation && matchesDepartment;
    });

  if (!events.length) {
    eventList.innerHTML = '<div class="empty-state">No approved events match your filters.</div>';
    return;
  }

  eventList.innerHTML = events.map((event) => {
    const remaining = getRemainingSeats(event);
    const alreadyRegistered = api.getRegistrations().some((registration) => {
      return registration.eventId === event.id && registration.studentUserId === state.currentUser.id;
    });
    return `
      <article class="event-card">
        <div class="event-topline">
          <span class="badge approved">Approved</span>
          <span class="badge">${remaining} seats left</span>
        </div>
        <div>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.description)}</p>
        </div>
        <div class="card-meta">
          <span>${formatDate(event.date)}</span>
          <span>${formatTime(event.time)}</span>
          <span>${escapeHtml(event.location)}</span>
          <span>${escapeHtml(formatDepartments(event))}</span>
        </div>
        <div class="card-actions">
          <button class="primary-btn" type="button" data-register="${event.id}" ${remaining === 0 || alreadyRegistered ? "disabled" : ""}>
            ${alreadyRegistered ? "Registered" : remaining === 0 ? "Full" : "Register"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  eventList.querySelectorAll("[data-register]").forEach((button) => {
    button.addEventListener("click", () => openRegistration(button.dataset.register));
  });
}

function renderStudentRegistrations() {
  const list = document.querySelector("#studentRegistrationList");
  if (!list) {
    return;
  }

  const events = api.getEvents();
  const registrations = api.getRegistrations().filter((registration) => {
    return registration.studentUserId === state.currentUser.id;
  });

  if (!registrations.length) {
    list.innerHTML = '<div class="empty-state">You have not registered for any event yet.</div>';
    return;
  }

  list.innerHTML = registrations.map((registration) => {
    const event = events.find((item) => item.id === registration.eventId);
    return `
      <article class="stack-item">
        <div class="event-topline">
          <h4>${escapeHtml(event?.title || "Deleted event")}</h4>
          <span class="badge approved">Registered</span>
        </div>
        <p>${escapeHtml(registration.name)} | ${escapeHtml(registration.rollNo)} | ${escapeHtml(registration.department)}</p>
        <div class="card-meta">
          <span>${escapeHtml(registration.phone)}</span>
          <span>${escapeHtml(registration.email)}</span>
          <span>${event ? formatDate(event.date) : "No date"}</span>
          <span>${escapeHtml(event?.location || "No location")}</span>
        </div>
        <div class="item-actions">
          <button class="ghost-btn" type="button" data-edit-registration="${registration.id}">Edit</button>
          <button class="danger-btn" type="button" data-cancel-registration="${registration.id}">Cancel</button>
        </div>
      </article>
    `;
  }).join("");

  list.querySelectorAll("[data-edit-registration]").forEach((button) => {
    button.addEventListener("click", () => editRegistration(button.dataset.editRegistration));
  });

  list.querySelectorAll("[data-cancel-registration]").forEach((button) => {
    button.addEventListener("click", () => cancelStudentRegistration(button.dataset.cancelRegistration));
  });
}

function renderOrganizerEvents() {
  const organizerEventList = document.querySelector("#organizerEventList");
  const events = api.getEvents().filter((event) => event.createdBy === "organizer");

  if (!events.length) {
    organizerEventList.innerHTML = '<div class="empty-state">No organizer events created yet.</div>';
    return;
  }

  organizerEventList.innerHTML = events.map((event) => stackItem(event, false)).join("");
}

function renderAdminEvents() {
  const adminEventList = document.querySelector("#adminEventList");
  const events = api.getEvents().filter((event) => {
    return !state.adminStatusFilter || event.status === state.adminStatusFilter;
  });

  if (!events.length) {
    adminEventList.innerHTML = '<div class="empty-state">No events found for this status.</div>';
    return;
  }

  adminEventList.innerHTML = events.map((event) => stackItem(event, true)).join("");

  adminEventList.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => changeStatus(button.dataset.approve, "approved"));
  });

  adminEventList.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => changeStatus(button.dataset.reject, "rejected"));
  });

  adminEventList.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteEvent(button.dataset.delete));
  });
}

function renderRegistrations() {
  const registrationTable = document.querySelector("#registrationTable");
  const registrations = api.getRegistrations();
  const events = api.getEvents();
  const rows = registrations.filter((registration) => {
    const event = events.find((item) => item.id === registration.eventId);
    const text = `${registration.name} ${registration.rollNo} ${registration.department} ${registration.phone} ${registration.email} ${event?.title || ""}`.toLowerCase();
    return !state.registrationSearch || text.includes(state.registrationSearch);
  });

  if (!rows.length) {
    registrationTable.innerHTML = '<tr><td colspan="6">No student registrations found.</td></tr>';
    return;
  }

  registrationTable.innerHTML = rows.map((registration) => {
    const event = events.find((item) => item.id === registration.eventId);
    return `
      <tr>
        <td>${escapeHtml(registration.name)}</td>
        <td>${escapeHtml(registration.rollNo)}</td>
        <td>${escapeHtml(registration.department)}</td>
        <td>${escapeHtml(registration.phone)}</td>
        <td>${escapeHtml(registration.email)}</td>
        <td>${escapeHtml(event?.title || "Deleted event")}</td>
      </tr>
    `;
  }).join("");
}

function stackItem(event, includeActions) {
  const remaining = getRemainingSeats(event);
  const actions = includeActions ? `
    <div class="item-actions">
      <button class="ghost-btn" type="button" data-approve="${event.id}">Approve</button>
      <button class="ghost-btn" type="button" data-reject="${event.id}">Reject</button>
      <button class="danger-btn" type="button" data-delete="${event.id}">Delete</button>
    </div>
  ` : "";

  return `
    <article class="stack-item">
      <div class="event-topline">
        <h4>${escapeHtml(event.title)}</h4>
        <span class="badge ${event.status}">${capitalize(event.status)}</span>
      </div>
      <p>${escapeHtml(event.description)}</p>
      <div class="card-meta">
        <span>${escapeHtml(event.organizer)}</span>
        <span>${formatDate(event.date)}</span>
        <span>${formatTime(event.time)}</span>
        <span>${escapeHtml(event.location)}</span>
        <span>${escapeHtml(formatDepartments(event))}</span>
        <span>${remaining}/${event.seats} seats left</span>
      </div>
      ${actions}
    </article>
  `;
}

function handleOrganizerEvent(event) {
  event.preventDefault();
  api.createEvent({
    title: value("#orgEventTitle"),
    organizer: value("#orgName"),
    date: value("#orgEventDate"),
    time: value("#orgEventTime"),
    location: value("#orgEventLocation"),
    departments: selectedValues("#orgEventDepartment"),
    seats: value("#orgEventSeats"),
    description: value("#orgEventDescription"),
    status: "pending",
    createdBy: "organizer"
  });

  event.currentTarget.reset();
  setDefaultDates();
  renderAll();
  showToast("Event submitted to admin for approval.");
}

function handleAdminEvent(event) {
  event.preventDefault();
  api.createEvent({
    title: value("#adminEventTitle"),
    organizer: value("#adminEventOrganizer"),
    date: value("#adminEventDate"),
    time: value("#adminEventTime"),
    location: value("#adminEventLocation"),
    departments: selectedValues("#adminEventDepartment"),
    seats: value("#adminEventSeats"),
    description: value("#adminEventDescription"),
    status: "approved",
    createdBy: "admin"
  });

  event.currentTarget.reset();
  setDefaultDates();
  renderAll();
  showToast("Admin event created and published.");
}

function handleRegistration(event) {
  event.preventDefault();

  const rollNo = value("#studentRoll").toUpperCase();
  const phone = value("#studentPhone");
  const email = value("#studentEmail");

  if (!isValidRollNo(rollNo)) {
    showToast("Roll number must be between H220001 and H250999.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    showToast("Phone number must be a valid 10 digit Indian mobile number.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Enter a valid email address.");
    return;
  }

  try {
    const registrationPayload = {
      eventId: value("#registerEventId"),
      studentUserId: state.currentUser.id,
      name: value("#studentName"),
      rollNo,
      phone,
      email,
      department: value("#studentDepartment")
    };

    if (value("#registrationId")) {
      api.updateRegistration(value("#registrationId"), registrationPayload);
      showToast("Registration information updated.");
    } else {
      api.registerStudent(registrationPayload);
      showToast("Registration completed successfully.");
    }

    event.currentTarget.reset();
    resetRegistrationForm();
    renderAll();
  } catch (error) {
    showToast(error.message);
  }
}

function openRegistration(eventId) {
  const event = api.getEvents().find((item) => item.id === eventId);
  if (!event) {
    showToast("Event not found.");
    return;
  }

  document.querySelector("#registerEventId").value = event.id;
  document.querySelector("#registrationId").value = "";
  document.querySelector("#selectedEventTitle").textContent = event.title;
  document.querySelector("#registrationSubmitBtn").textContent = "Submit Registration";
  document.querySelector("#registrationForm").classList.remove("hidden");
  document.querySelector("#registrationForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function editRegistration(registrationId) {
  const registration = api.getRegistrations().find((item) => item.id === registrationId);
  const event = api.getEvents().find((item) => item.id === registration?.eventId);
  if (!registration || !event) {
    showToast("Registration record not found.");
    return;
  }

  document.querySelector("#registrationId").value = registration.id;
  document.querySelector("#registerEventId").value = registration.eventId;
  document.querySelector("#selectedEventTitle").textContent = `Edit: ${event.title}`;
  document.querySelector("#studentName").value = registration.name;
  document.querySelector("#studentRoll").value = registration.rollNo;
  document.querySelector("#studentPhone").value = registration.phone;
  document.querySelector("#studentEmail").value = registration.email;
  document.querySelector("#studentDepartment").value = registration.department;
  document.querySelector("#registrationSubmitBtn").textContent = "Update Registration";
  document.querySelector("#registrationForm").classList.remove("hidden");
  document.querySelector("#registrationForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelStudentRegistration(registrationId) {
  const confirmed = window.confirm("Cancel this registration?");
  if (!confirmed) {
    return;
  }

  api.cancelRegistration(registrationId);
  resetRegistrationForm();
  renderAll();
  showToast("Registration cancelled.");
}

function changeStatus(eventId, status) {
  api.updateEventStatus(eventId, status);
  renderAll();
  showToast(`Event marked as ${status}.`);
}

function deleteEvent(eventId) {
  const confirmed = window.confirm("Delete this event and its registrations?");
  if (!confirmed) {
    return;
  }

  api.deleteEvent(eventId);
  renderAll();
  showToast("Event deleted.");
}

function resetDemoData() {
  api.resetDemoData();
  showToast("Demo data restored. Please login again.");
  window.setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

function exportRegistrationsCsv() {
  const registrations = api.getRegistrations();
  if (!registrations.length) {
    showToast("No registrations available to export.");
    return;
  }

  const events = api.getEvents();
  const header = ["Name", "Roll No", "Department", "Phone", "Email", "Event"];
  const rows = registrations.map((registration) => {
    const event = events.find((item) => item.id === registration.eventId);
    return [
      registration.name,
      registration.rollNo,
      registration.department,
      registration.phone,
      registration.email,
      event?.title || "Deleted event"
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "university-event-registrations.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function getRemainingSeats(event) {
  const registrations = api.getRegistrations().filter((registration) => registration.eventId === event.id);
  return Math.max(0, Number(event.seats) - registrations.length);
}

function getEventDepartments(event) {
  return Array.isArray(event.departments) && event.departments.length
    ? event.departments
    : [event.department].filter(Boolean);
}

function formatDepartments(event) {
  return getEventDepartments(event).join(", ");
}

function isValidRollNo(rollNo) {
  if (!/^H\d{6}$/.test(rollNo)) {
    return false;
  }

  const number = Number(rollNo.slice(1));
  return number >= 220001 && number <= 250999;
}

function setSessionName() {
  const sessionUser = document.querySelector("#sessionUser");
  if (sessionUser && state.currentUser) {
    sessionUser.textContent = `${state.currentUser.name} (${capitalize(state.currentUser.role)})`;
  }
}

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = today;
    if (!input.value) {
      input.value = today;
    }
  });
}

function setText(selector, valueToSet) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = valueToSet;
  });
}

function on(selector, eventName, handler) {
  const element = document.querySelector(selector);
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function selectedValues(selector) {
  return Array.from(document.querySelector(selector).selectedOptions).map((option) => option.value);
}

function resetRegistrationForm() {
  const form = document.querySelector("#registrationForm");
  if (!form) {
    return;
  }

  form.reset();
  form.classList.add("hidden");
  document.querySelector("#registrationId").value = "";
  document.querySelector("#registerEventId").value = "";
  document.querySelector("#selectedEventTitle").textContent = "Selected Event";
  document.querySelector("#registrationSubmitBtn").textContent = "Submit Registration";
}

function value(selector) {
  return document.querySelector(selector).value.trim();
}

function formatDate(dateText) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateText}T00:00:00`));
}

function formatTime(timeText) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(`2026-01-01T${timeText}`));
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

init();
