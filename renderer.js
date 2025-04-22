// Get Electron components
const { ipcRenderer } = require('electron');

// DOM Elements
const minimizeBtn = document.getElementById('minimize');
const maximizeBtn = document.getElementById('maximize');
const closeBtn = document.getElementById('close');
const addModuleBtn = document.getElementById('add-module');
const taskModal = document.getElementById('task-modal');
const cancelTaskBtn = document.getElementById('cancel-task');
const addTaskBtn = document.getElementById('add-task');
const taskTitleInput = document.getElementById('task-title');
const taskSummaryInput = document.getElementById('task-summary');
const taskTimeInput = document.getElementById('task-time');
const taskRolloverInput = document.getElementById('task-rollover');
const moduleGrid = document.getElementById('module-grid');
const completedGrid = document.getElementById('completed-grid');
const toggleCompletedBtn = document.getElementById('toggle-completed');
const currentDateElement = document.getElementById('date-text');
const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');
const calendarBtn = document.getElementById('calendar-btn');
const calendarPicker = document.getElementById('calendar-picker');
const calendarDays = document.getElementById('calendar-days');
const monthDisplay = document.getElementById('month-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarTodayBtn = document.getElementById('calendar-today');
const calendarCloseBtn = document.getElementById('calendar-close');

// Add this function to handle various ID formats from previous versions
function normalizeId(id) {
  // If it's already a number, return it
  if (typeof id === 'number') {
    return id;
  }
  
  // If it's a string that can be parsed as a number
  if (typeof id === 'string' && !isNaN(parseFloat(id))) {
    return parseFloat(id);
  }
  
  // If it's anything else (including string+number from Math.random()),
  // convert to string and hash it to a number
  const idString = String(id);
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    const char = idString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Add this function to migrate legacy data
function migrateTaskData() {
  const savedTasks = localStorage.getItem('todoTasks');
  
  if (savedTasks) {
    try {
      let tasks = JSON.parse(savedTasks);
      let migrated = false;
      
      // Iterate through each date's tasks
      Object.keys(tasks).forEach(dateKey => {
        if (tasks[dateKey].pending) {
          // Migrate pending tasks
          tasks[dateKey].pending.forEach(task => {
            // Fix any task without a proper ID
            if (task.id === undefined || task.id === null) {
              task.id = Date.now() + Math.floor(Math.random() * 10000);
              migrated = true;
            }
            
            // Ensure the ID is a clean number
            if (typeof task.id !== 'number' || isNaN(task.id) || !isFinite(task.id)) {
              task.id = normalizeId(task.id);
              migrated = true;
            }
            
            // Ensure summary exists
            if (!task.summary) {
              task.summary = '';
              migrated = true;
            }
          });
        }
        
        if (tasks[dateKey].completed) {
          // Migrate completed tasks
          tasks[dateKey].completed.forEach(task => {
            // Fix any task without a proper ID
            if (task.id === undefined || task.id === null) {
              task.id = Date.now() + Math.floor(Math.random() * 10000);
              migrated = true;
            }
            
            // Ensure the ID is a clean number
            if (typeof task.id !== 'number' || isNaN(task.id) || !isFinite(task.id)) {
              task.id = normalizeId(task.id);
              migrated = true;
            }
            
            // Ensure summary exists
            if (!task.summary) {
              task.summary = '';
              migrated = true;
            }
          });
        }
        
        // Ensure both pending and completed arrays exist
        if (!tasks[dateKey].pending) {
          tasks[dateKey].pending = [];
          migrated = true;
        }
        if (!tasks[dateKey].completed) {
          tasks[dateKey].completed = [];
          migrated = true;
        }
      });
      
      // Save migrated tasks if changes were made
      if (migrated) {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        console.log('Task data migrated successfully');
      }
      
      return tasks;
    } catch (error) {
      console.error('Error migrating tasks:', error);
      return {};
    }
  }
  
  return {};
}

// Window Controls
minimizeBtn.addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});

maximizeBtn.addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

closeBtn.addEventListener('click', () => {
  ipcRenderer.send('close-window');
});

// Date Management
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Format date for display
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

// Format date for storage key
function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Update displayed date
function updateDateDisplay() {
  const today = new Date();
  const isToday = currentDate.getDate() === today.getDate() && 
                 currentDate.getMonth() === today.getMonth() && 
                 currentDate.getFullYear() === today.getFullYear();
  
  if (isToday) {
    currentDateElement.textContent = `Today, ${formatDate(currentDate).split(', ').slice(1).join(', ')}`;
  } else {
    currentDateElement.textContent = formatDate(currentDate);
  }
  
  // Load tasks for the current date
  loadTasks();
}

// Previous day
prevDayBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
});

// Next day
nextDayBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
});

// Generate calendar days
function generateCalendarDays(month, year) {
  calendarDays.innerHTML = '';
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // Day of the week (0-6)
  
  // Update month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  monthDisplay.textContent = `${monthNames[month]} ${year}`;
  
  // Previous month's days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day other-month';
    dayElement.textContent = prevMonthLastDay - i;
    dayElement.addEventListener('click', () => {
      const newDate = new Date(year, month - 1, prevMonthLastDay - i);
      selectDate(newDate);
    });
    calendarDays.appendChild(dayElement);
  }
  
  // Current month's days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    dayElement.textContent = i;
    
    // Check if it's today
    if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
      dayElement.classList.add('today');
    }
    
    // Check if it's the selected date
    if (year === currentDate.getFullYear() && month === currentDate.getMonth() && i === currentDate.getDate()) {
      dayElement.classList.add('selected');
    }
    
    dayElement.addEventListener('click', () => {
      const newDate = new Date(year, month, i);
      selectDate(newDate);
    });
    
    calendarDays.appendChild(dayElement);
  }
  
  // Next month's days
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - (startingDay + daysInMonth);
  for (let i = 1; i <= remainingCells; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day other-month';
    dayElement.textContent = i;
    dayElement.addEventListener('click', () => {
      const newDate = new Date(year, month + 1, i);
      selectDate(newDate);
    });
    calendarDays.appendChild(dayElement);
  }
}

// Select a date from the calendar
function selectDate(date) {
  currentDate = date;
  calendarPicker.style.display = 'none';
  updateDateDisplay();
}

// Calendar button
calendarBtn.addEventListener('click', () => {
  if (calendarPicker.style.display === 'block') {
    calendarPicker.style.display = 'none';
  } else {
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    generateCalendarDays(currentMonth, currentYear);
    calendarPicker.style.display = 'block';
  }
});

// Previous month
prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendarDays(currentMonth, currentYear);
});

// Next month
nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendarDays(currentMonth, currentYear);
});

// Today button
calendarTodayBtn.addEventListener('click', () => {
  const today = new Date();
  selectDate(today);
});

// Close calendar
calendarCloseBtn.addEventListener('click', () => {
  calendarPicker.style.display = 'none';
});

// Close calendar when clicking outside
document.addEventListener('click', (e) => {
  if (!calendarPicker.contains(e.target) && 
      e.target !== calendarBtn && 
      !calendarBtn.contains(e.target) &&
      calendarPicker.style.display === 'block') {
    calendarPicker.style.display = 'none';
  }
});

// Toggle completed tasks section
toggleCompletedBtn.addEventListener('click', () => {
  const isCollapsed = toggleCompletedBtn.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Expand
    toggleCompletedBtn.classList.remove('collapsed');
    completedGrid.style.height = 'auto';
    toggleCompletedBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
  } else {
    // Collapse
    toggleCompletedBtn.classList.add('collapsed');
    completedGrid.style.height = '0';
    toggleCompletedBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  }
});

// Modal Controls - update to reset form
addModuleBtn.addEventListener('click', () => {
  // Reset form fields
  taskTitleInput.value = '';
  taskSummaryInput.value = '';
  taskTimeInput.value = '';
  taskRolloverInput.checked = false;
  
  // Reset form title and button text if they were changed for editing
  document.querySelector('.modal-content h2').textContent = 'Add New Task';
  addTaskBtn.textContent = 'Add Task';
  
  // Remove any edit ID
  if (addTaskBtn.hasAttribute('data-edit-id')) {
    addTaskBtn.removeAttribute('data-edit-id');
  }
  
  // Show modal
  taskModal.style.display = 'flex';
  taskTitleInput.focus();
});

// Cancel button should also reset the form
cancelTaskBtn.addEventListener('click', () => {
  // Reset form title and button text if they were changed for editing
  document.querySelector('.modal-content h2').textContent = 'Add New Task';
  addTaskBtn.textContent = 'Add Task';
  
  // Remove any edit ID
  if (addTaskBtn.hasAttribute('data-edit-id')) {
    addTaskBtn.removeAttribute('data-edit-id');
  }
  
  taskModal.style.display = 'none';
});

// Close modal when clicking outside
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.style.display = 'none';
  }
});

// Task Management
let tasks = {}; // Tasks organized by date

// Update the initTasks function to include migration
function initTasks() {
  // First, migrate any legacy data
  tasks = migrateTaskData();
  
  // If no tasks were loaded from migration, check local storage again
  if (Object.keys(tasks).length === 0) {
    const savedTasks = localStorage.getItem('todoTasks');
    
    if (savedTasks) {
      try {
        tasks = JSON.parse(savedTasks);
      } catch (error) {
        console.error('Error parsing tasks:', error);
        tasks = {};
      }
    }
  }
  
  // Ensure initial date has tasks structure
  const dateKey = formatDateKey(currentDate);
  if (!tasks[dateKey]) {
    tasks[dateKey] = {
      pending: [],
      completed: []
    };
  }
}

// Load tasks for the current date
function loadTasks() {
  const dateKey = formatDateKey(currentDate);
  
  // Ensure the current date has a task array
  if (!tasks[dateKey]) {
    tasks[dateKey] = {
      pending: [],
      completed: []
    };
  }
  
  renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
  console.log('Saving tasks:', tasks); // Debug log
}

// Update the add task event listener to handle both adding and editing with normalizeId
addTaskBtn.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  const summary = taskSummaryInput.value.trim();
  const time = taskTimeInput.value;
  const rollover = taskRolloverInput.checked;
  
  if (title) {
    const dateKey = formatDateKey(currentDate);
    
    // Check if we're editing an existing task
    const editIdAttr = addTaskBtn.getAttribute('data-edit-id');
    
    if (editIdAttr) {
      const editId = normalizeId(editIdAttr);
      
      // Find the task with normalized IDs
      let taskIndex = -1;
      
      for (let i = 0; i < tasks[dateKey].pending.length; i++) {
        if (normalizeId(tasks[dateKey].pending[i].id) === editId) {
          taskIndex = i;
          break;
        }
      }
      
      if (taskIndex !== -1) {
        // Update the task
        tasks[dateKey].pending[taskIndex] = {
          ...tasks[dateKey].pending[taskIndex],
          title: title,
          summary: summary,
          time: time,
          rollover: rollover,
          updated: new Date().toISOString()
        };
        
        // Remove the edit ID
        addTaskBtn.removeAttribute('data-edit-id');
        // Reset the button text
        addTaskBtn.textContent = 'Add Task';
        // Reset the modal title
        document.querySelector('.modal-content h2').textContent = 'Add New Task';
      }
    } else {
      // Adding new task
      const newTask = {
        id: Date.now(), // Clean integer ID
        title: title,
        summary: summary,
        time: time,
        rollover: rollover,
        created: new Date().toISOString()
      };
      
      // Ensure the current date has a task array
      if (!tasks[dateKey]) {
        tasks[dateKey] = {
          pending: [],
          completed: []
        };
      }
      
      tasks[dateKey].pending.push(newTask);
    }
    
    saveTasks();
    renderTasks();
    taskModal.style.display = 'none';
  }
});

// Update the deleteTask function to use normalizeId
function deleteTask(id) {
  const dateKey = formatDateKey(currentDate);
  const normalizedId = normalizeId(id);
  
  // Convert tasks' IDs for comparison
  tasks[dateKey].pending = tasks[dateKey].pending.filter(task => {
    return normalizeId(task.id) !== normalizedId;
  });
  
  // Remove from completed tasks
  tasks[dateKey].completed = tasks[dateKey].completed.filter(task => {
    return normalizeId(task.id) !== normalizedId;
  });
  
  saveTasks();
  renderTasks();
}

// Update the completeTask function to use normalizeId
function completeTask(id) {
  const dateKey = formatDateKey(currentDate);
  const normalizedId = normalizeId(id);
  
  // Find the task with normalized IDs
  let taskIndex = -1;
  let taskToComplete = null;
  
  for (let i = 0; i < tasks[dateKey].pending.length; i++) {
    if (normalizeId(tasks[dateKey].pending[i].id) === normalizedId) {
      taskIndex = i;
      taskToComplete = tasks[dateKey].pending[i];
      break;
    }
  }
  
  if (taskIndex !== -1 && taskToComplete) {
    // Move task from pending to completed
    tasks[dateKey].pending.splice(taskIndex, 1);
    tasks[dateKey].completed.push({
      ...taskToComplete,
      completedAt: new Date().toISOString()
    });
    
    saveTasks();
    renderTasks();
  }
}

// Update the restoreTask function to use normalizeId
function restoreTask(id) {
  const dateKey = formatDateKey(currentDate);
  const normalizedId = normalizeId(id);
  
  // Find the task with normalized IDs
  let taskIndex = -1;
  let taskToRestore = null;
  
  for (let i = 0; i < tasks[dateKey].completed.length; i++) {
    if (normalizeId(tasks[dateKey].completed[i].id) === normalizedId) {
      taskIndex = i;
      taskToRestore = tasks[dateKey].completed[i];
      break;
    }
  }
  
  if (taskIndex !== -1 && taskToRestore) {
    // Move task from completed back to pending
    tasks[dateKey].completed.splice(taskIndex, 1);
    tasks[dateKey].pending.push({
      ...taskToRestore,
      completedAt: undefined
    });
    
    saveTasks();
    renderTasks();
  }
}

// Update the openEditModal function to use normalizeId
function openEditModal(id) {
  const dateKey = formatDateKey(currentDate);
  const normalizedId = normalizeId(id);
  
  // Find the task with normalized IDs
  let taskToEdit = null;
  
  for (let i = 0; i < tasks[dateKey].pending.length; i++) {
    if (normalizeId(tasks[dateKey].pending[i].id) === normalizedId) {
      taskToEdit = tasks[dateKey].pending[i];
      break;
    }
  }
  
  if (taskToEdit) {
    // Update modal title to indicate editing
    document.querySelector('.modal-content h2').textContent = 'Edit Task';
    
    // Fill in the form with the task data
    taskTitleInput.value = taskToEdit.title;
    taskSummaryInput.value = taskToEdit.summary || '';
    taskTimeInput.value = taskToEdit.time || '';
    taskRolloverInput.checked = taskToEdit.rollover || false;
    
    // Change the add button to save
    addTaskBtn.textContent = 'Save Changes';
    
    // Store the task ID being edited
    addTaskBtn.setAttribute('data-edit-id', normalizedId);
    
    // Show the modal
    taskModal.style.display = 'flex';
    taskTitleInput.focus();
  }
}

// Check for tasks to roll over from previous day
function checkRollovers() {
  const today = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  
  // If we have tasks from yesterday and today is a new day
  if (tasks[yesterdayKey] && formatDateKey(currentDate) === today) {
    const rollovers = tasks[yesterdayKey].pending.filter(task => task.rollover);
    
    if (rollovers.length > 0) {
      // Ensure today has a task array
      if (!tasks[today]) {
        tasks[today] = {
          pending: [],
          completed: []
        };
      }
      
      // Add the rollover tasks to today
      tasks[today].pending = [
        ...tasks[today].pending,
        ...rollovers.map(task => {
          // Generate a new numeric ID to avoid string/number mismatches
          const newId = Date.now() + Math.floor(Math.random() * 1000);
          
          return {
            ...task,
            rolledOver: true,
            // Generate new ID but keep reference to original
            originalId: task.id,
            id: newId // Use numeric ID
          };
        })
      ];
      
      saveTasks();
    }
  }
}

// Render all tasks
function renderTasks() {
  const dateKey = formatDateKey(currentDate);
  
  // Clear current tasks (except the Add Module button)
  const childrenToRemove = Array.from(moduleGrid.children).filter(child => !child.classList.contains('add-module'));
  childrenToRemove.forEach(child => moduleGrid.removeChild(child));
  
  // Clear completed tasks
  completedGrid.innerHTML = '';
  
  if (!tasks[dateKey]) {
    tasks[dateKey] = {
      pending: [],
      completed: []
    };
  }
  
  // Add each pending task
  tasks[dateKey].pending.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'module';
    
    let timeDisplay = '';
    if (task.time) {
      timeDisplay = `<div class="time"><i class="far fa-clock"></i> ${task.time}</div>`;
    }
    
    let rolloverDisplay = '';
    if (task.rollover) {
      rolloverDisplay = `<div class="rollover"><i class="fas fa-sync-alt"></i> Will roll over if not completed</div>`;
    }
    
    let rolledOverDisplay = '';
    if (task.rolledOver) {
      rolledOverDisplay = `<div class="rolled-over"><i class="fas fa-arrow-right"></i> Rolled over from previous day</div>`;
    }
    
    taskElement.innerHTML = `
      <div class="task-button-section">
        <button class="task-btn edit" data-id="${task.id}" title="Edit Task"><i class="fas fa-edit"></i></button>
        <button class="task-btn complete" data-id="${task.id}" title="Mark as Complete"><i class="fas fa-check"></i></button>
        <button class="task-btn delete" data-id="${task.id}" title="Delete Task"><i class="fas fa-times"></i></button>
      </div>
      <div class="task-content">
        <h3>${task.title}</h3>
        <p>${task.summary}</p>
        ${timeDisplay}
        ${rolloverDisplay}
        ${rolledOverDisplay}
      </div>
    `;
    
    // Insert after the add module button
    moduleGrid.insertBefore(taskElement, addModuleBtn.nextSibling);
    
    // Add event listeners
    const deleteBtn = taskElement.querySelector('.delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const idToDelete = normalizeId(deleteBtn.getAttribute('data-id'));
      deleteTask(idToDelete);
    });
    
    const completeBtn = taskElement.querySelector('.complete');
    completeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const idToComplete = normalizeId(completeBtn.getAttribute('data-id'));
      completeTask(idToComplete);
    });
    
    const editBtn = taskElement.querySelector('.edit');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const idToEdit = normalizeId(editBtn.getAttribute('data-id'));
      openEditModal(idToEdit);
    });
  });
  
  // Add each completed task
  tasks[dateKey].completed.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'module completed';
    
    let timeDisplay = '';
    if (task.time) {
      timeDisplay = `<div class="time"><i class="far fa-clock"></i> ${task.time}</div>`;
    }
    
    let completedTime = '';
    if (task.completedAt) {
      const completedDate = new Date(task.completedAt);
      completedTime = completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    taskElement.innerHTML = `
      <div class="task-button-section">
        <button class="task-btn restore" data-id="${task.id}" title="Restore Task"><i class="fas fa-undo"></i></button>
        <button class="task-btn delete" data-id="${task.id}" title="Delete Task"><i class="fas fa-times"></i></button>
      </div>
      <div class="task-content">
        <h3>${task.title}</h3>
        <p>${task.summary}</p>
        ${timeDisplay}
        <div class="time"><i class="fas fa-check-circle"></i> Completed at ${completedTime}</div>
      </div>
    `;
    
    completedGrid.appendChild(taskElement);
    
    // Add event listeners
    const deleteBtn = taskElement.querySelector('.delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const idToDelete = normalizeId(deleteBtn.getAttribute('data-id'));
      deleteTask(idToDelete);
    });
    
    const restoreBtn = taskElement.querySelector('.restore');
    restoreBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const idToRestore = normalizeId(restoreBtn.getAttribute('data-id'));
      restoreTask(idToRestore);
    });
  });
}

// Initialize the app
initTasks();
updateDateDisplay();
checkRollovers();