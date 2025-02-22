// Управление темой
const themeToggle = document.getElementById('theme-toggle');

// Загрузка сохраненной темы
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
});

// Структура для хранения задач
let tasksData = {
    'urgent-important': [],
    'not-urgent-important': [],
    'urgent-not-important': [],
    'not-urgent-not-important': []
};

// Загрузка задач
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        try {
            tasksData = JSON.parse(savedTasks);
        } catch (e) {
            console.error('Ошибка при загрузке задач:', e);
            tasksData = {
                'urgent-important': [],
                'not-urgent-important': [],
                'urgent-not-important': [],
                'not-urgent-not-important': []
            };
        }
    }
}

// Функция форматирования даты и времени
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    try {
        const date = new Date(dateTimeStr);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
        return dateTimeStr;
    }
}

// Функция добавления задачи
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const quadrantInput = document.getElementById('quadrantInput');
    
    if (!taskInput.value) {
        showMessage('Пожалуйста, введите задачу', 'error');
        return;
    }

    const newTask = {
    id: Date.now().toString(),
    title: taskInput.value,
    deadline: deadlineInput.value,
    completed: false 
};


    tasksData[quadrantInput.value].push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = '';
    deadlineInput.value = '';
    showMessage('Задача добавлена', 'success');
}

// Функция отображения задач
function renderTasks() {
    Object.keys(tasksData).forEach(quadrant => {
        const quadrantEl = document.getElementById(quadrant);
        if (!quadrantEl) return;
        
        quadrantEl.innerHTML = '';
        
        tasksData[quadrant].forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task';
            taskEl.draggable = true;
            taskEl.id = `task-${task.id}`;
            
            const formattedDate = task.deadline ? formatDateTime(task.deadline) : '';
            
            taskEl.innerHTML = `
                <div class="task-text">${task.title}</div>
                ${formattedDate ? `<div class="task-deadline">Дедлайн: ${formattedDate}</div>` : ''}
                <div class="task-controls">
                    <button class="btn" onclick="editTask('${task.id}', '${quadrant}')">Редактировать</button>
                    <button class="btn" onclick="deleteTask('${task.id}', '${quadrant}')">Удалить</button>
                </div>
            `;
            
            taskEl.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.setData('sourceQuadrant', quadrant);
            });
            quadrantEl.appendChild(taskEl);
        });
    });
}

// Функция редактирования задачи
function editTask(id, quadrant) {
    const task = tasksData[quadrant].find(t => t.id === id);
    if (!task) return;

    document.getElementById('editTaskInput').value = task.title;
    document.getElementById('editDeadlineInput').value = task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '';
    document.getElementById('editQuadrantInput').value = quadrant;
    
    // Сохраняем идентификатор текущей задачи и квадранта
    window.editingTaskData = { id, quadrant };
    
    document.getElementById('editModal').style.display = 'block';
}

// Функция сохранения изменений
function saveEdit() {
    if (!window.editingTaskData) return;
    
    const { id, quadrant } = window.editingTaskData;
    const taskIndex = tasksData[quadrant].findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const newQuadrant = document.getElementById('editQuadrantInput').value;
    const updatedTask = {
        id: id,
        title: document.getElementById('editTaskInput').value,
        deadline: document.getElementById('editDeadlineInput').value
    };

    // Удаляем задачу из старого квадранта
    tasksData[quadrant].splice(taskIndex, 1);
    // Добавляем в новый квадрант
    tasksData[newQuadrant].push(updatedTask);

    saveTasks();
    renderTasks();
    closeEditModal();
    showMessage('Задача обновлена', 'success');
}

// Функция закрытия модального окна
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    window.editingTaskData = null;
}

// Функция удаления задачи
function deleteTask(id, quadrant) {
    const taskIndex = tasksData[quadrant].findIndex(task => task.id === id);
    if (taskIndex === -1) {
        showMessage('Задача не найдена', 'error');
        return;
    }

    tasksData[quadrant].splice(taskIndex, 1);
    saveTasks();
    renderTasks();
    showMessage('Задача удалена', 'success');
}

// Функция сохранения задач
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasksData));
}

// Функция отображения сообщений
function showMessage(message, type) {
    const messageEl = document.getElementById('formMessage');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = type;
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = '';
    }, 3000);
}

// Обновленные функции Drag and Drop
function allowDrop(ev) {
    ev.preventDefault();
    const quadrant = ev.currentTarget;
    quadrant.style.opacity = '0.8';
}

function dragLeave(ev) {
    const quadrant = ev.currentTarget;
    quadrant.style.opacity = '1';
}

function drop(ev) {
    ev.preventDefault();
    const quadrant = ev.currentTarget;
    quadrant.style.opacity = '1';

    const taskId = ev.dataTransfer.getData('taskId');
    const sourceQuadrant = ev.dataTransfer.getData('sourceQuadrant');
    const targetQuadrant = quadrant.querySelector('.task-list').id;

    if (sourceQuadrant === targetQuadrant) return;

    const taskIndex = tasksData[sourceQuadrant].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = tasksData[sourceQuadrant][taskIndex];
        tasksData[sourceQuadrant].splice(taskIndex, 1);
        tasksData[targetQuadrant].push(task);
        saveTasks();
        renderTasks();
    }
}

// Функция импорта данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Проверяем структуру импортируемых данных
            const requiredQuadrants = ['urgent-important', 'not-urgent-important', 
                                     'urgent-not-important', 'not-urgent-not-important'];
            
            if (requiredQuadrants.every(q => Array.isArray(importedData[q]))) {
                tasksData = importedData;
                saveTasks();
                renderTasks();
                showMessage('Данные успешно импортированы', 'success');
            } else {
                throw new Error('Неверная структура данных');
            }
        } catch (error) {
            console.error('Ошибка импорта:', error);
            showMessage('Ошибка при импорте данных', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Функция экспорта данных
function exportData() {
    const dataStr = JSON.stringify(tasksData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `eisenhower-matrix-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('Данные экспортированы', 'success');
}

// Функция полного сброса
function resetAllTasks() {
    if (confirm('Вы уверены, что хотите удалить все задачи?')) {
        tasksData = {
            'urgent-important': [],
            'not-urgent-important': [],
            'urgent-not-important': [],
            'not-urgent-not-important': []
        };
        localStorage.removeItem('tasks');
        renderTasks();
        showMessage('Все задачи удалены', 'success');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    
    // Добавляем обработчики событий для drag and drop к квадрантам
    document.querySelectorAll('.quadrant').forEach(quadrant => {
        quadrant.addEventListener('dragover', allowDrop);
        quadrant.addEventListener('dragleave', dragLeave);
        quadrant.addEventListener('drop', drop);
    });
});


function renderTasks() {
    Object.keys(tasksData).forEach(quadrant => {
        const quadrantEl = document.getElementById(quadrant);
        if (!quadrantEl) return;
        
        quadrantEl.innerHTML = '';

        let sortedTasks = [...tasksData[quadrant]];
        sortedTasks.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

        sortedTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task';
            taskEl.draggable = true;
            taskEl.id = `task-${task.id}`;
            
            const formattedDate = task.deadline ? formatDateTime(task.deadline) : '';
            
            taskEl.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTaskCompletion('${task.id}', '${quadrant}')">
                <div class="task-text">${task.title}</div>
                ${formattedDate ? `<div class="task-deadline">Дедлайн: ${formattedDate}</div>` : ''}
                <div class="task-controls">
                    <button class="btn" onclick="editTask('${task.id}', '${quadrant}')">Редактировать</button>
                    <button class="btn" onclick="deleteTask('${task.id}', '${quadrant}')">Удалить</button>
                </div>
            `;
            
            taskEl.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.setData('sourceQuadrant', quadrant);
            });
            quadrantEl.appendChild(taskEl);
        });
    });
}

function toggleTaskCompletion(id, quadrant) {
    const task = tasksData[quadrant].find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}
