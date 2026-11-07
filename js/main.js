// ============================================
// FIREBASE IMPORTS
// ============================================

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// Get the currently logged-in user's Tasks collection
function getUserTasksCollection() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  return collection(db, "Users", user.uid, "Tasks");
}


// ============================================
// SIDEBAR MENU
// ============================================

const menus = document.querySelectorAll(".menu");
const sideMenu = document.querySelector(".side-menu");

menus.forEach((menu) => {

  menu.addEventListener("click", () => {

    if (!sideMenu) return;

    const isOpen = !sideMenu.classList.contains("active");

    sideMenu.classList.toggle("active", isOpen);

    menus.forEach((button) => {
      button.classList.toggle("xmark", isOpen);
    });

  });

});


// ============================================
// DEFAULT SETTINGS
// ============================================

const defaultSettings = {

  theme: "light",
  animations: true,
  sorting: "date",

  allowCreate: true,
  allowEdit: true,
  allowDelete: true,

  textSize: "medium",
  textColor: "#222222",
  fontFamily: "system",
  highContrast: false,

  taskEncryption: false

};


// ============================================
// LOAD SAVED SETTINGS
// ============================================

let settings;

try {

  settings = {

    ...defaultSettings,

    ...JSON.parse(
      localStorage.getItem("todoSettings") || "{}"
    )

  };

} catch (error) {

  console.error("Settings loading error:", error);

  settings = { ...defaultSettings };

}


// ============================================
// APPLY THEME
// ============================================

function applyTheme(themeValue) {

  let darkMode = false;

  if (themeValue === "dark") {

    darkMode = true;

  } else if (themeValue === "system") {

    darkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  }

  document.body.classList.toggle(
    "dark-theme",
    darkMode
  );

}


// ============================================
// APPLY TASK PERMISSIONS
// ============================================

function applyTaskPermissions() {

  const taskForm = document.getElementById("task-form");

  if (taskForm) {

    const controls = taskForm.querySelectorAll(
      "input, select, textarea, button"
    );

    controls.forEach((control) => {

      control.disabled = !settings.allowCreate;

    });

  }

}


// ============================================
// APPLY ALL SETTINGS
// ============================================

function applySettings() {

  // THEME

  applyTheme(settings.theme);


  // ANIMATIONS

  document.body.classList.toggle(
    "no-animations",
    !settings.animations
  );


  // TEXT SIZE

  const sizes = {

    small: 0.85,
    medium: 1,
    large: 1.15,
    "extra-large": 1.3

  };

  document.documentElement.style.setProperty(
    "--text-scale",
    sizes[ settings.textSize ] || 1
  );


  // TEXT COLOUR

  document.documentElement.style.setProperty(
    "--user-text-color",
    settings.textColor
  );

  document.body.classList.toggle(
    "custom-text-color",
    !settings.highContrast
  );


  // FONT FAMILY

  const fonts = {

    system: "Arial, sans-serif",
    arial: "Arial, sans-serif",
    georgia: "Georgia, serif",
    verdana: "Verdana, sans-serif"

  };

  document.documentElement.style.setProperty(
    "--font-family",
    fonts[ settings.fontFamily ] || fonts.system
  );


  // HIGH CONTRAST

  document.body.classList.toggle(
    "high-contrast",
    settings.highContrast
  );


  // TASK PERMISSIONS

  applyTaskPermissions();

}


// ============================================
// RESTORE SETTINGS ON EVERY PAGE
// ============================================

applySettings();


// ============================================
// SETTINGS PAGE ELEMENTS
// ============================================

const theme = document.getElementById("theme");
const animations = document.getElementById("animations");
const sorting = document.getElementById("sorting");

const allowCreate = document.getElementById("allow-create");
const allowEdit = document.getElementById("allow-edit");
const allowDelete = document.getElementById("allow-delete");

const textSize = document.getElementById("text-size");
const textColor = document.getElementById("text-color");
const fontFamily = document.getElementById("font-family");
const highContrast = document.getElementById("high-contrast");

const taskEncryption = document.getElementById("task-encryption");

const savebtn = document.getElementById("save-settings");
const resetbtn = document.getElementById("reset-settings");


// ============================================
// RESTORE SETTINGS CONTROLS
// ============================================

if (theme) theme.value = settings.theme;
if (animations) animations.checked = settings.animations;
if (sorting) sorting.value = settings.sorting;

if (allowCreate) allowCreate.checked = settings.allowCreate;
if (allowEdit) allowEdit.checked = settings.allowEdit;
if (allowDelete) allowDelete.checked = settings.allowDelete;

if (textSize) textSize.value = settings.textSize;
if (textColor) textColor.value = settings.textColor;
if (fontFamily) fontFamily.value = settings.fontFamily;
if (highContrast) highContrast.checked = settings.highContrast;

if (taskEncryption) {
  taskEncryption.checked = settings.taskEncryption;
}


// ============================================
// SAVE SETTINGS
// ============================================

if (savebtn) {

  savebtn.addEventListener("click", () => {

    settings = {

      theme: theme?.value || "light",
      animations: animations?.checked ?? true,
      sorting: sorting?.value || "date",

      allowCreate: allowCreate?.checked ?? true,
      allowEdit: allowEdit?.checked ?? true,
      allowDelete: allowDelete?.checked ?? true,

      textSize: textSize?.value || "medium",
      textColor: textColor?.value || "#222222",
      fontFamily: fontFamily?.value || "system",
      highContrast: highContrast?.checked ?? false,

      // Encryption is not implemented yet.
      taskEncryption: false

    };

    try {

      localStorage.setItem(
        "todoSettings",
        JSON.stringify(settings)
      );

      applySettings();

      alert("Settings saved successfully!");

    } catch (error) {

      console.error(error);

      alert("Unable to save settings!");

    }

  });

}


// ============================================
// RESET SETTINGS
// ============================================

if (resetbtn) {

  resetbtn.addEventListener("click", () => {

    const confirmed = confirm(
      "Are you sure you want to reset all settings?"
    );

    if (!confirmed) return;

    settings = { ...defaultSettings };

    localStorage.removeItem("todoSettings");

    if (theme) theme.value = settings.theme;
    if (animations) animations.checked = settings.animations;
    if (sorting) sorting.value = settings.sorting;

    if (allowCreate) allowCreate.checked = true;
    if (allowEdit) allowEdit.checked = true;
    if (allowDelete) allowDelete.checked = true;

    if (textSize) textSize.value = settings.textSize;
    if (textColor) textColor.value = settings.textColor;
    if (fontFamily) fontFamily.value = settings.fontFamily;
    if (highContrast) highContrast.checked = false;

    if (taskEncryption) taskEncryption.checked = false;

    applySettings();

    alert("Settings have been reset!");

  });

}


// ============================================
// SYSTEM THEME CHANGE DETECTION
// ============================================

const systemTheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
);

systemTheme.addEventListener("change", () => {

  if (settings.theme === "system") {
    applyTheme("system");
  }

});


// ============================================
// SORT TASKS
// ============================================

function sortTasks(tasks) {

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  };

  const statusOrder = {
    "Not Started": 1,
    "Ongoing": 2,
    "Completed": 3
  };

  switch (settings.sorting) {

    case "priority":

      tasks.sort((a, b) =>
        (priorityOrder[ a.data.Priority ] || 4) -
        (priorityOrder[ b.data.Priority ] || 4)
      );

      break;

    case "status":

      tasks.sort((a, b) =>
        (statusOrder[ a.data.Status ] || 4) -
        (statusOrder[ b.data.Status ] || 4)
      );

      break;

    case "alphabetical":

      tasks.sort((a, b) =>
        (a.data.Task || "").localeCompare(
          b.data.Task || ""
        )
      );

      break;

    case "date":

    default:

      tasks.sort((a, b) =>
        (a.data.Date || "").localeCompare(
          b.data.Date || ""
        )
      );

      break;

  }

  return tasks;

}


// ============================================
// CREATE TASK
// ============================================

const submit = document.querySelector("#task-form");

if (submit) {

  submit.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!settings.allowCreate) {

      alert("Task creation is disabled!");

      return;

    }

    const task = document.querySelector("#task").value;
    const status = document.querySelector("#status").value;
    const date = document.querySelector("#date").value;
    const priority = document.querySelector("#priority").value;
    const description = document.querySelector("#description").value;

    const values = {

      Task: task.trim(),
      Status: status.trim(),
      Date: date.trim(),
      Priority: priority.trim(),
      Description: description.trim()

    };


    // VALIDATION

    if (
      !values.Task ||
      !values.Status ||
      !values.Date ||
      !values.Priority
    ) {

      alert("Please fill all required details!");

      return;

    }


    // SAVE TO FIREBASE

    try {

      await addDoc(getUserTasksCollection(), values);

      alert("Task saved successfully!");

      submit.reset();

      await showtasks();

    } catch (error) {

      console.error("Task creation error:", error);

      alert("Failed to save task!");

    }

  });

}


// ============================================
// CREATE TASK DETAIL
// ============================================

function createDetail(label, value) {

  const div = document.createElement("div");

  const strong = document.createElement("strong");

  strong.className = "subtitle";
  strong.textContent = label + ": ";

  const small = document.createElement("small");

  small.textContent = value ?? "";

  div.append(strong, small);

  return div;

}


// ============================================
// EDIT TASK
// ============================================

async function editTask(taskId, data) {

  if (!auth.currentUser) {
    alert("Your session has expired. Please log in again.");
    return;
  }

  if (!settings.allowEdit) {

    alert("Task editing is disabled!");

    return;

  }

  const newTask = prompt(
    "Task Name:",
    data.Task || ""
  );

  if (newTask === null) return;

  if (!newTask.trim()) {

    alert("Task name cannot be empty!");

    return;

  }

  const newStatus = prompt(
    "Status (Not Started, Ongoing, Completed):",
    data.Status || "Not Started"
  );

  if (newStatus === null) return;

  const validStatuses = [
    "Not Started",
    "Ongoing",
    "Completed"
  ];

  if (!validStatuses.includes(newStatus.trim())) {

    alert("Invalid task status!");

    return;

  }

  const newDate = prompt(
    "Date (YYYY-MM-DD):",
    data.Date || ""
  );

  if (newDate === null) return;

  const newPriority = prompt(
    "Priority (low, medium, high):",
    data.Priority || "medium"
  );

  if (newPriority === null) return;

  if (![ "low", "medium", "high" ].includes(newPriority.trim())) {

    alert("Invalid priority!");

    return;

  }

  const newDescription = prompt(
    "Description:",
    data.Description || ""
  );

  if (newDescription === null) return;


  try {

    await updateDoc(
      doc(
        db,
        "Users",
        auth.currentUser.uid,
        "Tasks",
        taskId
      ),
      {
        Task: newTask.trim(),
        Status: newStatus.trim(),
        Date: newDate.trim(),
        Priority: newPriority.trim(),
        Description: newDescription.trim()
      }
    );

    alert("Task updated successfully!");

    await refreshTaskViews();

  } catch (error) {

    console.error("Task update error:", error);

    alert("Failed to update task!");

  }

}


// ============================================
// DELETE TASK
// ============================================

async function deleteTask(taskId) {

  if (!auth.currentUser) {
    alert("Your session has expired. Please log in again.");
    return;
  }

  if (!settings.allowDelete) {

    alert("Task deletion is disabled!");

    return;

  }

  const confirmed = confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) return;


  try {

    await deleteDoc(
      doc(
        db,
        "Users",
        auth.currentUser.uid,
        "Tasks",
        taskId
      )
    );

    alert("Task deleted successfully!");

    await refreshTaskViews();

  } catch (error) {

    console.error("Task deletion error:", error);

    alert("Failed to delete task!");

  }

}


// ============================================
// CREATE TASK CARD
// ============================================

// Builds one task card. Shared by the Home page and the
// Task Manager search so both pages render identical cards.

function createTaskCard(task) {

  const data = task.data;

  const taskItem = document.createElement("div");

  taskItem.className = "task-item";
  taskItem.id = task.id;


  // TITLE

  const title = document.createElement("h3");

  title.textContent = data.Task || "Untitled Task";


  // DETAILS

  const status = createDetail(
    "Status",
    data.Status
  );

  const date = createDetail(
    "Date",
    data.Date
  );

  const priority = createDetail(
    "Priority",
    data.Priority
  );

  const description = createDetail(
    "Description",
    data.Description || "No Description"
  );


  // ACTION BUTTONS

  const actions = document.createElement("div");

  actions.className = "task-actions";


  // EDIT BUTTON

  if (settings.allowEdit) {

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {

      editTask(task.id, data);

    });

    actions.appendChild(editButton);

  }


  // DELETE BUTTON

  if (settings.allowDelete) {

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.className = "danger-btn";

    deleteButton.addEventListener("click", () => {

      deleteTask(task.id);

    });

    actions.appendChild(deleteButton);

  }


  // ADD EVERYTHING

  taskItem.append(
    title,
    status,
    date,
    priority,
    description
  );

  if (actions.children.length > 0) {

    taskItem.appendChild(actions);

  }

  return taskItem;

}


// ============================================
// SELECT HOME PAGE TASKS
// ============================================

// Home page shows the five most recent tasks (latest Date first)
// plus every high-priority task. A Map keyed by task id guarantees
// a task is never included twice.

const HOME_RECENT_TASK_LIMIT = 5;

function selectHomeTasks(tasks) {

  const selected = new Map();

  [ ...tasks ]
    .sort((a, b) =>
      (b.data.Date || "").localeCompare(
        a.data.Date || ""
      )
    )
    .slice(0, HOME_RECENT_TASK_LIMIT)
    .forEach((task) => {

      selected.set(task.id, task);

    });

  tasks.forEach((task) => {

    const priority = String(task.data.Priority || "")
      .trim()
      .toLowerCase();

    if (priority === "high") {

      selected.set(task.id, task);

    }

  });

  return [ ...selected.values() ];

}


// ============================================
// READ AND DISPLAY TASKS (HOME PAGE)
// ============================================

async function showtasks() {

  const tasklist = document.querySelector(".task-list");

  if (!tasklist) return;

  tasklist.innerHTML = "Loading tasks...";

  try {

    const snapshot = await getDocs(getUserTasksCollection());

    tasklist.innerHTML = "";

    if (snapshot.empty) {

      tasklist.textContent = "No tasks found!";

      return;

    }


    // CONVERT FIRESTORE DOCUMENTS

    let tasks = snapshot.docs.map((documentSnapshot) => ({

      id: documentSnapshot.id,
      data: documentSnapshot.data()

    }));


    // KEEP ONLY RECENT + HIGH-PRIORITY TASKS

    tasks = selectHomeTasks(tasks);


    // SORT TASKS

    tasks = sortTasks(tasks);


    // DISPLAY TASKS

    tasks.forEach((task) => {

      tasklist.appendChild(createTaskCard(task));

    });

  } catch (error) {

    console.error("Task retrieval error:", error);

    tasklist.textContent = "Failed to retrieve tasks!";

  }

}


// ============================================
// REFRESH TASK VIEWS
// ============================================

// Used after editing or deleting a task. Each call is a no-op on
// pages that do not have the corresponding task list.

async function refreshTaskViews() {

  await showtasks();

  await refreshTaskSearch();

}


// ============================================
// INITIALIZE TASK LIST
// ============================================

if (document.querySelector(".task-list")) {

  onAuthStateChanged(auth, (user) => {

    if (user) {
      showtasks();
    }

  });

}


// ============================================
// SORTING CHANGE
// ============================================

if (sorting) {

  sorting.addEventListener("change", () => {

    settings.sorting = sorting.value;

    showtasks();

  });

}


// ============================================
// EXPORT TASKS
// ============================================

const exportButton = document.getElementById("export-tasks");

if (exportButton) {

  exportButton.addEventListener("click", async () => {

    try {

      const snapshot = await getDocs(getUserTasksCollection());

      const tasks = snapshot.docs.map((documentSnapshot) => ({

        id: documentSnapshot.id,
        ...documentSnapshot.data()

      }));

      const json = JSON.stringify(tasks, null, 2);

      const blob = new Blob(
        [ json ],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "todo-tasks.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Keep the object URL alive briefly so the browser can start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      alert("Tasks exported successfully!");

    } catch (error) {

      console.error("Export error:", error);

      alert("Unable to export tasks!");

    }

  });

}


// ============================================
// IMPORT TASKS
// ============================================

const importButton = document.getElementById("import-tasks");
const importFile = document.getElementById("import-file");

if (importButton && importFile) {

  importButton.addEventListener("click", () => {

    importFile.click();

  });


  importFile.addEventListener("change", async () => {

    const file = importFile.files[ 0 ];

    if (!file) return;

    try {

      const text = await file.text();

      const importedTasks = JSON.parse(text);

      if (!Array.isArray(importedTasks)) {

        throw new Error("Invalid JSON format.");

      }

      const confirmed = confirm(
        `Import ${importedTasks.length} tasks?`
      );

      if (!confirmed) {

        importFile.value = "";

        return;

      }


      for (const task of importedTasks) {

        if (
          typeof task.Task !== "string" ||
          typeof task.Status !== "string" ||
          typeof task.Date !== "string" ||
          typeof task.Priority !== "string"
        ) {

          throw new Error("Invalid task data.");

        }

      }


      for (const task of importedTasks) {

        await addDoc(getUserTasksCollection(), {

          Task: task.Task,
          Status: task.Status,
          Date: task.Date,
          Priority: task.Priority,
          Description: task.Description || ""

        });

      }

      alert("Tasks imported successfully!");

      await showtasks();

    } catch (error) {

      console.error("Import error:", error);

      alert("Unable to import tasks. Check the JSON file.");

    }

    importFile.value = "";

  });

}

// ============================================
// CLEAR COMPLETED TASKS
// ============================================

const clearCompleted = document.getElementById("clear-completed");

if (clearCompleted) {

  clearCompleted.addEventListener("click", async () => {

    const confirmed = confirm(
      "Delete all completed tasks?"
    );

    if (!confirmed) return;

    try {

      const snapshot = await getDocs(getUserTasksCollection());

      const completedTasks = snapshot.docs.filter(
        (item) => item.data().Status === "Completed"
      );

      if (completedTasks.length === 0) {

        alert("No completed tasks found!");

        return;

      }


      // FIRESTORE BATCH LIMIT: 500 OPERATIONS

      for (let i = 0; i < completedTasks.length; i += 500) {

        const batch = writeBatch(db);

        completedTasks.slice(i, i + 500).forEach((item) => {

          batch.delete(item.ref);

        });

        await batch.commit();

      }

      alert(
        `${completedTasks.length} completed tasks deleted!`
      );

      await showtasks();

    } catch (error) {

      console.error("Clear completed error:", error);

      alert("Unable to clear completed tasks!");

    }

  });

}


// ============================================
// DELETE ALL TASKS
// ============================================

const deleteAll = document.getElementById("delete-all");

if (deleteAll) {

  deleteAll.addEventListener("click", async () => {

    const confirmed = confirm(
      "WARNING: This will permanently delete ALL tasks. Continue?"
    );

    if (!confirmed) return;

    try {

      const snapshot = await getDocs(getUserTasksCollection());

      const allTasks = snapshot.docs;

      for (let i = 0; i < allTasks.length; i += 500) {

        const batch = writeBatch(db);

        allTasks.slice(i, i + 500).forEach((item) => {

          batch.delete(item.ref);

        });

        await batch.commit();

      }

      alert("All tasks have been deleted!");

      await showtasks();

    } catch (error) {

      console.error("Delete all error:", error);

      alert("Unable to delete all tasks!");

    }

  });

}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

const changePassword = document.getElementById("change-password");

if (changePassword) {

  changePassword.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user || !user.email) {
      alert("Please log in before changing your password.");
      return;
    }

    const confirmed = confirm(
      `Send a password reset link to ${user.email}?`
    );

    if (!confirmed) return;

    try {

      await sendPasswordResetEmail(auth, user.email);

      alert(
        `Password reset email sent to ${user.email}. ` +
        "Follow the instructions in that email to set a new password."
      );

    } catch (error) {

      console.error("Password reset error:", error);

      if (error.code === "auth/too-many-requests") {
        alert("Too many requests. Please try again later.");
      } else {
        alert("Unable to send the password reset email. Please try again.");
      }

    }

  });

}


// ============================================
// ENCRYPTION PASSWORD
// ============================================

const encryptionPassword = document.getElementById(
  "encryption-password"
);

if (encryptionPassword) {

  encryptionPassword.addEventListener("click", () => {

    alert(
      "Task encryption is not yet configured. " +
      "A secure encryption system must be implemented before using this feature."
    );

  });

}


// ============================================
// TASK ENCRYPTION
// ============================================

if (taskEncryption) {

  taskEncryption.addEventListener("change", () => {

    if (taskEncryption.checked) {

      alert(
        "Encryption is not yet implemented. " +
        "This option cannot be enabled until secure encryption is configured."
      );

      taskEncryption.checked = false;

    }

  });

}


// ============================================
// TASK MANAGER SEARCH
// ============================================

const searchInput = document.getElementById("search");
const taskList = document.getElementById("task-list");

const SEARCH_DEBOUNCE_MS = 300;

let searchDebounceTimer = null;
let latestSearchRequestId = 0;
let lastCompletedSearchQuery = null;


// Show a plain message in the search results area

function showSearchMessage(message) {

  if (!taskList) return;

  taskList.innerHTML = "";

  const paragraph = document.createElement("p");

  paragraph.textContent = message;
  paragraph.style.textAlign = "center";
  taskList.appendChild(paragraph);

}


// Resolve with the signed-in user once Firebase has restored the session

function waitForAuthUser() {

  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {

      unsubscribe();

      resolve(user);

    });

  });

}


// Case-insensitive match on name, description, status, priority and date

function taskMatchesSearch(data, query) {

  return [
    data.Task,
    data.Description,
    data.Status,
    data.Priority,
    data.Date
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ")
    .includes(query);

}


async function runTaskSearch({ force = false } = {}) {

  if (!searchInput || !taskList) return;

  const query = searchInput.value.trim().toLowerCase();


  // Same query already displayed: nothing to do

  if (!force && query && query === lastCompletedSearchQuery) return;


  // Any newer call invalidates older in-flight searches

  const requestId = ++latestSearchRequestId;

  lastCompletedSearchQuery = null;


  // EMPTY SEARCH: show prompt, do not load tasks

  if (!query) {

    showSearchMessage("Search for a task by name.");

    return;

  }

  showSearchMessage("Searching tasks...");

  try {

    const user = await waitForAuthUser();

    if (requestId !== latestSearchRequestId) return;

    if (!user) {

      showSearchMessage("Please log in to search your tasks.");

      return;

    }

    const snapshot = await getDocs(getUserTasksCollection());

    if (requestId !== latestSearchRequestId) return;

    let matches = snapshot.docs
      .map((documentSnapshot) => ({

        id: documentSnapshot.id,
        data: documentSnapshot.data()

      }))
      .filter((task) => taskMatchesSearch(task.data, query));

    lastCompletedSearchQuery = query;

    if (matches.length === 0) {

      showSearchMessage("No matching tasks found.");

      return;

    }

    matches = sortTasks(matches);

    taskList.innerHTML = "";

    matches.forEach((task) => {

      taskList.appendChild(createTaskCard(task));

    });

  } catch (error) {

    if (requestId !== latestSearchRequestId) return;

    console.error("Task search error:", error);

    showSearchMessage("Unable to search tasks.");

  }

}


// Re-run the current search after a task was edited or deleted

async function refreshTaskSearch() {

  if (!searchInput || !taskList) return;

  clearTimeout(searchDebounceTimer);

  await runTaskSearch({ force: true });

}


if (searchInput && taskList) {

  searchInput.addEventListener("input", () => {

    clearTimeout(searchDebounceTimer);

    // Clearing the field shows the prompt immediately

    if (!searchInput.value.trim()) {

      runTaskSearch();

      return;

    }

    searchDebounceTimer = setTimeout(
      runTaskSearch,
      SEARCH_DEBOUNCE_MS
    );

  });

  // Initial state (search prompt, or restored field value)

  runTaskSearch();

}



async function searchByTask(query) {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  const text = String(query ?? "").trim().toLowerCase();
  const requestId = String(Number(taskList.dataset.searchRequest || 0) + 1);
  taskList.dataset.searchRequest = requestId;

  const show = (message) => {
    taskList.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = message;
    taskList.appendChild(p);
  };

  if (!text) { show("Search for a task."); return; }
  show("Searching tasks...");

  try {
    const user = auth.currentUser || await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (taskList.dataset.searchRequest !== requestId) return;
    if (!user) { show("Please log in to search your tasks."); return; }

    const snapshot = await getDocs(getUserTasksCollection());
    if (taskList.dataset.searchRequest !== requestId) return;

    let matches = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .filter((t) => String(t.data.Task ?? "").toLowerCase().includes(text));

    if (!matches.length) { show("No matching tasks found."); return; }

    matches = sortTasks(matches);
    taskList.innerHTML = "";
    matches.forEach((t) => taskList.appendChild(createTaskCard(t)));
  } catch (error) {
    if (taskList.dataset.searchRequest !== requestId) return;
    console.error("Task name search error:", error);
    show("Unable to search tasks.");
  }
}


async function searchByPriority(priority) {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  const text = String(priority ?? "").trim().toLowerCase();
  const requestId = String(Number(taskList.dataset.searchRequest || 0) + 1);
  taskList.dataset.searchRequest = requestId;

  const show = (message) => {
    taskList.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = message;
    taskList.appendChild(p);
  };

  if (!text) { show("Search for a task."); return; }
  show("Searching tasks...");

  try {
    const user = auth.currentUser || await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (taskList.dataset.searchRequest !== requestId) return;
    if (!user) { show("Please log in to search your tasks."); return; }

    const snapshot = await getDocs(getUserTasksCollection());
    if (taskList.dataset.searchRequest !== requestId) return;

    let matches = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .filter((t) => String(t.data.Priority ?? "").trim().toLowerCase() === text);

    if (!matches.length) { show("No matching tasks found."); return; }

    matches = sortTasks(matches);
    taskList.innerHTML = "";
    matches.forEach((t) => taskList.appendChild(createTaskCard(t)));
  } catch (error) {
    if (taskList.dataset.searchRequest !== requestId) return;
    console.error("Task priority search error:", error);
    show("Unable to search tasks.");
  }
}


async function searchByDate(date) {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  const text = String(date ?? "").trim();
  const requestId = String(Number(taskList.dataset.searchRequest || 0) + 1);
  taskList.dataset.searchRequest = requestId;

  const show = (message) => {
    taskList.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = message;
    taskList.appendChild(p);
  };

  if (!text) { show("Search for a task."); return; }
  show("Searching tasks...");

  try {
    const user = auth.currentUser || await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (taskList.dataset.searchRequest !== requestId) return;
    if (!user) { show("Please log in to search your tasks."); return; }

    const snapshot = await getDocs(getUserTasksCollection());
    if (taskList.dataset.searchRequest !== requestId) return;

    // "2026-11-07" = one day, "2026-11" = whole month, "2026" = whole year
    let matches = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .filter((t) => String(t.data.Date ?? "").trim().startsWith(text));

    if (!matches.length) { show("No matching tasks found."); return; }

    matches = sortTasks(matches);
    taskList.innerHTML = "";
    matches.forEach((t) => taskList.appendChild(createTaskCard(t)));
  } catch (error) {
    if (taskList.dataset.searchRequest !== requestId) return;
    console.error("Task date search error:", error);
    show("Unable to search tasks.");
  }
}


// ============================================
// CATEGORY FILTER
// ============================================

const filterCategory = document.getElementById("filter-category");
const filterInput = document.getElementById("filter-input");
let filterTimer = null;

if (filterCategory && filterInput) {

  const filterPlaceholders = {
    task: "Filter by task name...",
    priority: "Filter by priority (low, medium, high)...",
    date: "Filter by date (YYYY-MM-DD, YYYY-MM or YYYY)..."
  };

  const runCategoryFilter = () => {
    const value = filterInput.value;

    if (filterCategory.value === "priority") {
      searchByPriority(value);
    } else if (filterCategory.value === "date") {
      searchByDate(value);
    } else {
      searchByTask(value);
    }
  };

  filterInput.addEventListener("input", () => {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(runCategoryFilter, 300);
  });

  filterCategory.addEventListener("change", () => {
    filterInput.placeholder = filterPlaceholders[filterCategory.value];
    clearTimeout(filterTimer);
    runCategoryFilter();
  });

}
// ============================================
// END OF SCRIPT
// ============================================
