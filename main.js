// @ elements
// References to HTML elements
// ------------------------------------------

const addTodoButton = document.getElementById('add-todo-button');
const addTodoContainer = document.getElementById('add-todo-container');

const newTodoTitleInput = document.getElementById('new-todo-title-input');
const newTodoDescriptionInput = document.getElementById('new-todo-description-input');
const newTodoCategory = document.getElementById('new-todo-category');
const newTodoDueDateInput = document.getElementById('new-todo-due-input');

const todoList = document.getElementById('todo-list');
const categoryFilterList = document.getElementById('category-filter-list');

// Color variables

const style = getComputedStyle(document.body);
const colors = {
  red: style.getPropertyValue('--red'),
  orange: style.getPropertyValue('--orange'),
  yellow: style.getPropertyValue('--yellow'),
  green: style.getPropertyValue('--green'),
  blue: style.getPropertyValue('--blue'),
  purple: style.getPropertyValue('--purple'),
  gray: style.getPropertyValue('--gray')
}


// X ----------------------------------------
// @ data
// ------------------------------------------

let editing = null;
let filterCategory = null;
let categoryInput = null;
let activeFilters = [];

const todos = [
  { id: 1, title: 'Take out the trash', category: 'Chores', created: 1711954800000, done: true, doneDate: 1713175200000 },
  { id: 2, title: 'Do the dishes', category: 'Chores', created: 1711954860000, done: false },
  { id: 3, title: 'Take an afternoon walk', category: 'Health & Fitness', created: 1711954980000, done: false },
  { id: 4, title: 'Visit grandma', category: 'Social', created: 1713175200000, done: false },
  { id: 5, title: 'Buy new socks', created: 1713720600000, done: false },
  { id: 6, title: 'Turn in weekly spreadsheet', created: 1714291200000, due: 1716876000000, category: 'Work', done: false }
];

const categories = [
  { label: 'Chores', color: colors.red, icon: 'fa-solid fa-broom' },
  { label: 'Work', color: colors.blue, icon: 'fa-solid fa-briefcase' },
  { label: 'Health & Fitness', color: colors.green, icon: 'fa-solid fa-person-running' },
  { label: 'Social', color: colors.orange, icon: 'fa-solid fa-comments' },
  { label: 'Hobbies', color: colors.purple, icon: 'fa-solid fa-puzzle-piece' }
];


// X ----------------------------------------
// @ utilities
// ------------------------------------------

// Find a todo by its ID
function findTodoById(id) {
  return todos.find(todo => todo.id === id);
}

// Find a todo's index in the todo array by its ID
function findTodoIndexById(id) {
  const todo = findTodoById(id);
  return todos.indexOf(todo);
}

// Get a todo's DOM element by its ID
function getTodoElementById(id) {
  return document.getElementById(`todo-item-${id}`);
}

// Find a category by its label
function getCategoryByLabel(label) {
  return categories.find(category => category.label === label);
}

function hideAddTodoContainer() {
  addTodoContainer.classList.add('hidden-content');
}


// X ----------------------------------------
// @ manage_todos
// ------------------------------------------

function addTodo(render = false) {
  if (newTodoTitleInput.value) {
    const newId = Date.now();

    todos.push({
      id: newId,
      title: newTodoTitleInput.value,
      description: newTodoDescriptionInput.value,
      category: categoryInput,
      created: newId,
      due: Date.parse(newTodoDueDateInput.value),
      done: false,
      doneDate: null
    });

    console.log(`[added] id: ${newId}, title: ${newTodoTitleInput.value}`);
    newTodoTitleInput.value = '';
    newTodoDescriptionInput.value = '';
    categoryInput = null;
    newTodoDueDateInput.value = "";

    hideAddTodoContainer();

    if (render === true) {
      renderTodoItem(newId);
    }
  }
}

function deleteTodo(id) {
  const index = findTodoIndexById(id);
  const el = getTodoElementById(id);
  console.log(`[removing] id: ${id}, index: ${index}, ${el}`);
  el.remove();
  todos.splice(index, 1);
}

function editTodo(id) {
  const index = findTodoIndexById(id);

  if (editing !== null) {
    renderTodoList();
    // const prompt = document.getElementById('edit-prompt');
    // prompt.remove();

    if (editing === id) {
      editing = null;
      return;
    }
  }

  if (editing !== id) {
    const todo = getTodoElementById(id);
    todo.classList.add('editing');

    todo.innerHTML = `
    <form id="todo-update-form">
      <label>Title</label>
      <input type="text" id="todo-title-update" value="${todos[index].title}" class="flex-1">
      <label>Description</label>
      <input type="text" id="todo-description-update" placeholder="Add a description" value="${todos[index]?.description ? todos[index].description : ''}" class="flex-1">

      <ul id="todo-assign-category" class="category-list"></ul>

      <div class="flex row align-items-center">
        <label for="todo-due-update">Due date</label>
        <input type="datetime-local" id="todo-due-update" value="${todos[index].due ? new Date(todos[index].due).toISOString().slice(0,-1) : null}">
      </div>

      <div class="actions">
        <button type="button" onclick="cancelEdit()" class="flat">Cancel</button>
        <button type="submit" class="positive"><i class="fa-solid fa-floppy-disk"></i> Save</button>

      </div>
    </form>
  `;

    editing = todos[index].id;

    const categoryList = document.getElementById('todo-assign-category');
    renderCategories(categoryList, 'assign');

    if (todos[index].category) {
      const selectedCategory = [...categoryList.children].find((child) => child.title === todos[index].category);
      selectedCategory.classList.add('selected');
    }
  }
}

function updateTodo(id) {
  const index = findTodoIndexById(id);
  const updateTitle = document.getElementById('todo-title-update');
  const updateDescription = document.getElementById('todo-description-update');
  const updateDueDate = document.getElementById('todo-due-update');

  if (updateTitle.value) {
    todos[index].title = updateTitle.value;
    todos[index].description = updateDescription.value;

    if (categoryInput !== null) {
      todos[index].category = categoryInput;
    }

    categoryInput = null;

    if (updateDueDate.value) {
      todos[index].due = Date.parse(updateDueDate.value);
    }

    editing = null;
  }

  renderTodoList();
  console.log("Updated todo.");
}

function completeTodo(id) {
  const todo = getTodoElementById(id);
  const index = findTodoIndexById(id);

  todos[index].done = !todos[index].done;

  if (todos[index].done) {
    todos[index].doneDate = Date.now();
  } else {
    todos[index].doneDate = null;
  }

  renderTodoList();
}

function cancelEdit() {
  console.log("Cancel edit.");
  // const todo = findTodoById(editing);
  // if (todo) renderTodoItem(todo.id);
  editing = null;
  renderTodoList();
}


// X ----------------------------------------
// @ render_todos
// ------------------------------------------

function renderTodoList(source = todos) {
  todoList.replaceChildren();

  if (source.length !== 0) {
    source
      .sort((a,b) => new Date(a.created) - new Date(b.created))
      .forEach((todo) => {
        renderTodoItem(todo.id);
      });
  } else {
    const NoTodosText = document.createElement('p');
    NoTodosText.innerText = 'No todos found.';
    NoTodosText.classList.add('text-container');
    todoList.appendChild(NoTodosText);
  }

  // const newTodoButton = document.createElement('button');
  // newTodoButton.innerHTML = '&#43; Create new todo';
  // newTodoButton.classList.add('text-left', 'flat', 'positive', 'text-positive');
  // todoList.appendChild(newTodoButton);
  
}

// Render a todo item to the todo list
function renderTodoItem(id) {
  const todo = findTodoById(id);
  const index = findTodoIndexById(id);

  const el = document.createElement('li');
  el.classList.add('todo-item');

  if (todos[index].due && todos[index].due < Date.now()) {

    el.classList.add('overdue');
  }

  el.id = `todo-item-${todo.id}`;

  let color;

  if (todo.category) {
    color = getCategoryByLabel(todo.category).color;
  }

  el.innerHTML = `
  <div style="background:${todo?.category ? color : colors.gray}" title="${todo?.category ? todo.category : ''}" class="category"></div>
    ${todo?.category ? '' : ''}

      <input type="checkbox" class="checkbox" onclick="completeTodo(${id})" id="check-${id}" ${todo?.done ? "checked" : ""}>
      <label for="check-${id}"></label>

    <div class="todo-content">
    <div class="title">${todos[index].title}</div>



    ${todos[index]?.description ? `<div class="description">${todos[index].description}</div>` : ''}

    <div class="dates">
      <div class="date"><i class="fa-regular fa-square-plus"></i> ${new Date(todos[index].created).toDateString()}</div>
      ${todos[index]?.due ? `<div class="date date--due"><i class="fa-solid fa-clock"></i> ${new Date(todos[index].due).toDateString()}</div>` : ''}
      ${todos[index]?.doneDate ? `<div class="date date--due"><i class="fa-solid fa-clock"></i> ${new Date(todos[index].doneDate).toDateString()}</div>` : ''}

    </div>
    </div>

    <div class="todo-options">
    <button onclick="deleteTodo(${id})" class="icon text-warning"><i class="fa-regular fa-trash-can"></i></button>
    <button onclick="editTodo(${id})" class="icon text-positive"><i class="fa-solid fa-pen-to-square"></i></button>
    </div>
  `;

  todoList.prepend(el);
}


// X ----------------------------------------
// @ categories
// ------------------------------------------

function renderCategories(parent = categoryFilterList, action = null) {

  categories.forEach(category => {
    const el = document.createElement('li');
    el.style.background = category.color;
    el.setAttribute('title', category.label);

    if (category.icon) {
      el.innerHTML = `<i class="${category.icon} icon"></i>`;
    }

    el.onclick = () => {
      if (action === 'assign') {
        clearCategorySelection(parent);
        el.classList.add('selected');
        categoryInput = category.label;
      } else {
      el.classList.toggle('selected');
        filterCategories(category.label);
      }
    }

    parent.appendChild(el);
  });
}

// Remove the selected class from category elements
function clearCategorySelection(parent = categoryFilterList) {
  [...parent.children].forEach(child => {
    child.classList.remove('selected');
  });
}

// Render the list of availabe categories to filter by
function renderCategoryFilterList(setting = null) {
  renderCategories();

  const allButton = document.createElement('li');
  allButton.innerHTML = `<button onclick="filterCategories()">All</button>`;
  categoryFilterList.appendChild(allButton);

  const noCategoryButton = document.createElement('li');
  noCategoryButton.innerHTML = `<button onclick="filterCategories('none')">No category</button>`;
  categoryFilterList.appendChild(noCategoryButton);
}

// Filter todos by categories
function filterCategories(label = null) {
  editing = null;

  // If no category has been provided, return all todos
  if (!label) {
    activeFilters = [];
    renderTodoList();
    clearCategorySelection(categoryFilterList);
    return;

    // Return todos that do not have a category
  } else if (label === 'none') {
    activeFilters = [];
    const filteredCategories = todos.filter(todo => !todo.category);
    renderTodoList(filteredCategories);
    clearCategorySelection(categoryFilterList);

    // Add category to the list of filters
  } else {
    if (activeFilters.includes(label)) {
      const index = activeFilters.indexOf(label);
      activeFilters.splice(index, 1);
    } else {
      activeFilters.push(label);
    }

    // Apply the filters
    let filteredTodos = [];

    activeFilters.forEach(filter => {
      filteredTodos = filteredTodos.concat(todos.filter(todo => todo.category === filter));
    });

    if (activeFilters.length == 0) {
      renderTodoList();
    } else {
      renderTodoList(filteredTodos);
    }
  }
}


// X ----------------------------------------
// @ event_listeners
// ------------------------------------------

// Add todo when clicking on button
addTodoButton.addEventListener(
  'click', () => {
    addTodo(true);
  }
);

// Display more options when selecting the new todo input element
newTodoTitleInput.addEventListener(
  'click', () => {
    if (newTodoTitleInput === document.activeElement) {
      addTodoContainer.classList.remove('hidden-content');
    }
    cancelEdit();
    renderTodoList();
  }
);

// Submit the changes from editing a todo
document.querySelector('body').addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.matches('#todo-update-form')) {
    updateTodo(editing);
  }
});

// Hide the addtodo expanded editor when you click outside of the editor
document.querySelector('body').addEventListener('click', event => {
  if (!event.target.closest('#add-todo-container')) {
    hideAddTodoContainer();
  }
});

// Hide the add todo expanded editor when you scroll down
window.onscroll = () => {
  if (newTodoTitleInput === document.activeElement) {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      hideAddTodoContainer();
    }
  }
};


// X ----------------------------------------
// @ initalizing code
// ------------------------------------------

renderTodoList();
renderCategoryFilterList();
renderCategories(newTodoCategory, 'assign');


// X ----------------------------------------