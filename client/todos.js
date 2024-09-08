// grab all elements 
const form = document.querySelector("[data-form]");//By Attribute
const lists = document.querySelector("[data-lists]");
const input = document.querySelector("[data-input]");
//--keep array Global fo UI variable fo UI Display
let todoArr=[]
//once the browser is loaded
// Function to fetch user object by email from the server
async function getUserByEmail(email) {
    try {
        const response = await fetch('/getUserByEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
}

// Function to load user data and update UI
// Function to load user data and update UI
async function loadUserDataAndUpdateUI() {
    const userEmail = sessionStorage.getItem('userEmail');
    try {
        const response = await fetch('/getUserByEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
        });

        if (response.status === 404) {
            // User not found, redirect to login page
            sessionStorage.removeItem("userEmail");
            // alert("you need to connect first")
            window.location.href = "/login";
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const user = await response.json();
        if (user.todos && Array.isArray(user.todos)) {
            user.todos.forEach(element => {
                todoArr.push(new Todo(element.id, element.todo));
            });
            Storage.addTodStorage(todoArr)
            document.getElementById('username').textContent = user.username;
            document.getElementById('email').textContent = user.email;
            UI.displayData();
            UI.registerRemoveTodo();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

//once the browser is loaded
window.addEventListener('DOMContentLoaded', loadUserDataAndUpdateUI);

///--ToDo Class: Each Visual Element Should be 
//--related to ToDO Object
class Todo {
    constructor(id, todo){
        this.id = id;
        this.todo = todo;
    }
}
//--Class To handle Storage Operations
//-- Of todo array
class Storage
{
    //Get Array Of Class Objects 
    static addTodStorage(todoArr){
        let storage = localStorage.setItem("todo", JSON.stringify(todoArr));
        return storage;
    }

    //Get From Storage By Key
    static getStorage(){
        let storage = localStorage.getItem("todo") === null ? 
        [] : JSON.parse(localStorage.getItem("todo"));
        return storage
    }

}


//Submit
form.addEventListener("submit", (e) => {
     //Disble continue sumit processing...
    e.preventDefault();
    //Create New Object By User Input
    const id = Math.random() * 1000000;
    const todo = new Todo(id, input.value);
   // todoArr.push(todo);
    todoArr = [...todoArr,todo];
  
    UI.displayData();
    UI.clearInput();
    //add to storage

    Storage.addTodStorage(todoArr);
});

//Handle UI Operation 
class UI{

    //--Go Over All Array Elements 
    //--And Generate HTML Items Dynamically
    static displayData(){
        
        //-Generate Html
        //-each Delete Icon Injected with 
        //--data-id = {id of the object}
        let displayData = todoArr.map((item) => {
            return `
                <div class="todo">
                <p>${item.todo}</p>
                <span class="remove" data-id = ${item.id}>🗑️</span>
                </div>
            `
        });
        //--Put generated html in a container
        lists.innerHTML = (displayData).join(" ");
    }
   
    //--Clear Input Element
    static clearInput(){
       
        input.value = "";
    }
    //--Remove Element When Clicked
    static registerRemoveTodo(){
        //--Register Click  For Deleting a toto row
        //--The Click is on the List Div Container

        lists.addEventListener("click", (e) => {
           
            console.log(e.target.outerHTML);//Inner Clicked 
            console.log(e.currentTarget.outerHTML);//Registered Clicked

            if(e.target.classList.contains("remove")){
                //Get Id of clicked delete
                let btnId = e.target.dataset.id;
                //--Remove Element From HTML DOM
                
                //remove from array.
                UI.removeArrayTodo(btnId, e.target);

            }
        
        });
    }
   
   //Remove Element From UI And Update LocalStorage
    static removeArrayTodo(id,elementClicked){
        elementClicked.parentElement.remove();
        todoArr = todoArr.filter((item) => item.id !== +id);
        Storage.addTodStorage(todoArr);
    }
}
document.getElementById("logoutBtn").addEventListener("click", function() {
    // Clear session storage
    sessionStorage.removeItem("userEmail");
    localStorage.removeItem("todo");
    window.location.href = "/login";
});



document.getElementById("btn-save").addEventListener("click", async function() {
    try {
        // Update the todos in MongoDB
        await saveTodosToMongoDB();
    } catch (error) {
        console.error("Error saving todos to MongoDB:", error);
    }
});

async function saveTodosToMongoDB() {
    const userEmail = sessionStorage.getItem("userEmail");
    try {
        // Update the user document in MongoDB with the new todos array
        const response = await fetch('/updateUserTodos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail, todos: todoArr })
        });

        if (!response.ok) {
            throw new Error('Failed to save todos');
        }

        console.log('Todos saved successfully');
    } catch (error) {
        console.error("Error saving todos to MongoDB:", error);
        throw error;
    }
}
window.addEventListener('beforeunload', () => {
    todoArr = [];
});




