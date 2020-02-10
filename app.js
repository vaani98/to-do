todo = []

// window.todo = todo;
DOMStrings = {
    'add-button': 'add-btn',
    'new-text' : 'new-task',
    'todo-list': 'tasks',
    'edit-btn': '.edit-btn',
    'done-btn': '.done-btn',
    'delete-btn': '.delete-btn',
}

clearText = element => {
    element.value = '';
}

//render a new task onto the UI
addTask = (addText, done = false) =>{
    let markup = `
    <li>
        <input type="checkbox" ${done?'checked': ''}><input type="text" value="${addText}" ${done?'class = "done"': ''} readonly>
        <img src="https://img.icons8.com/pastel-glyph/64/000000/edit.png" class = "icon-btns edit-btn"/>
        <img src="https://img.icons8.com/color/50/000000/delete-forever.png" class = "icon-btns delete-btn"/>
    </li>
    `
    if(addText){
        // debugger;
        document.getElementById(DOMStrings['todo-list']).insertAdjacentHTML('afterbegin', markup);
    }
}


//find nearest edit button sibling
findEdit = (el) =>{
    let siblings = Array.from(el.parentNode.children);
    let edit;
    for(i=0; i<siblings.length; i++){
        if(siblings[i].className.includes("edit-btn")||(siblings[i].className.includes("done-btn")))
            edit = siblings[i];
    }
    return edit;
}

//find nearest text element sibling
findTextElement = element => {
    let el;
    var children = Array.from(element.parentNode.children);
    children.forEach(element => {
        if(element.type==='text'){
            el = element;
        }        
    });
    return el;
}

//handle the edit event
handleEdit = target => {
    let el = findTextElement(target);
    el.focus();
    edit = findEdit(el);
    let x = edit.className;
    el.style.border = x.includes('edit-btn')?"1px solid black": "0";
    el.readOnly = x.includes('edit-btn')?false: true;
    edit.src = x.includes('edit-btn')?"https://img.icons8.com/doodle/48/000000/checkmark.png":"https://img.icons8.com/pastel-glyph/64/000000/edit.png"
    
    edit.classList.toggle('edit-btn');
    edit.classList.toggle('done-btn');

    //store in global state 
    if(edit.className.includes('edit-btn')){
        let index = todo.findIndex(o => o.editing === true);
        todo[index].addText = el.value;
        todo[index].editing = false;    
        persistData(todo);
    }
    else{
        let index = todo.findIndex(o => o.addText === el.value);
        todo[index].editing = true;
    }
}


//when checkbox is checked, toggle class, store in global state 
toggleDone = element =>{
    element.classList.toggle('done');
    let index = todo.findIndex(o => o.addText === element.value);
    todo[index].done = !todo[index].done;
}

//handle the checkbox event
handleCheck = target => {
    el = findTextElement(target)
    toggleDone(el);
    persistData(todo);
}

//handle the delete event 
handleDelete = target => {
    target.parentNode.parentNode.removeChild(target.parentNode);
    element = findTextElement(target)
    const index = todo.findIndex(el=>el.addText === element.value);
    todo.splice(index, 1);
    persistData(todo);
}

addTodo = () => {
    let addBar = document.getElementById(DOMStrings['new-text']);
    let addText = addBar.value;
    if(addText){
        addTask(addText);
        clearText(addBar);    
        addBar.focus();
        todo.push({addText, 'done': false, 'time': Date.now() });
        persistData(todo);
    }       
}

document.getElementById(DOMStrings['add-button']).addEventListener('click', addTodo);


document.getElementById(DOMStrings['new-text']).addEventListener('keydown', (e)=>{
    if (e.keyCode === 13) {
        addTodo()
    }
})

document.getElementById(DOMStrings['todo-list']).addEventListener('click', (e)=>{
    if(e.target.matches('input[type="checkbox"]')){
        handleCheck(e.target);
    }else if(e.target.matches(DOMStrings['edit-btn'])||e.target.matches(DOMStrings['done-btn'])){
        handleEdit(e.target);
    }else if(e.target.matches(DOMStrings['delete-btn'])){
        handleDelete(e.target);
    }
})

document.getElementById(DOMStrings['todo-list']).addEventListener('keydown', (e)=>{
    if(e.target.matches('input[type="text"]') && (e.keyCode===13)){
        handleEdit(e.target);
    }
});


persistData = data =>{
    localStorage.setItem('todo', JSON.stringify(todo));
}

readStorage = () =>{
    const storage = JSON.parse(localStorage.getItem('todo'));
    if(storage){
        todo = storage;
        return true;
    }
    return false;   
}

renderList = todo => {
    for(let i = 0; i<todo.length; i++){
        if(todo[i].done){
            addTask(todo[i].addText, true);
        }
        else{
            addTask(todo[i].addText);
        }
    } 
}


clearList = () =>{
    document.getElementById(DOMStrings['todo-list']).innerHTML = '';
}

window.addEventListener('load', ()=>{
    document.getElementById(DOMStrings['new-text']).focus();
    let status = readStorage();
    clearList();
    if(status){
        renderList(todo);
    }
});

document.getElementById('sort_date').addEventListener('click', ()=>{
    todo = todo.sort((a, b) => a.time - b.time);
    console.log(todo);
    clearList();

    renderList(todo);
})

document.getElementById('sort_alpha').addEventListener('click', ()=>{
    clearList();
    todo = todo.sort((a, b) => b.addText.localeCompare(a.addText))
    renderList(todo)
    console.log(todo);
})