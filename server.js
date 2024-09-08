// Import necessary modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// MongoDB related imports
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://matandb:0538273882@cluster0matanew.bioxnzx.mongodb.net/?retryWrites=true&w=majority";

// Database Name
const dbName = 'userDb';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB server
client.connect(err => {
    if (err) {
        console.error('Failed to connect to the database:', err);
        return;
    }
    console.log('Connected successfully to the database');
});

// Get the database reference
const db = client.db(dbName);

// Collection Name
const collectionName = 'users'; 

// Get the collection reference
const usersCollection = db.collection(collectionName);

// Initialize the Express app
const port = 3001;
const app = express();

// Body parser middleware
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Serve static files from the 'public' directory
app.use(express.static("client"));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/todos', async (req, res) => {
    res.sendFile(path.join(__dirname, "client", "todos.html"));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "registerUser.html"));
});

app.post('/register', urlencodedParser, async (request, response) => {
    console.log("post Requested...");
   
    let userObj = {
        email: request.body.email,
        password: request.body.password,
        username: request.body.username,
        todos: []
    };

    // Check for empty fields
    if (checkEmptyFields(request.body)) {
        return response.status(400); // Bad Request
    }
    // Check if email already exists
    if (await isExistEmail(request.body.email)) {
        return response.status(400);
    }
    // Validate email format
    if (!isValidEmail(request.body.email)) {
        return response.status(400);
    }
    // Validate password
    if (!isPasswordValid(request.body.password, request.body.repeatPassword)) {
        return response.status(400);
    }

    try {
        // Insert the user into the database
        const result = await usersCollection.insertOne(userObj);
        console.log('User inserted:', result.insertedId);
    } catch (err) {
        console.error('Error inserting user:', err);
        return response.status(500).send('Error registering user'); // Internal Server Error
    }
    response.status(200).redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "LoginUser.html"));
});

app.post('/login', urlencodedParser, async (request, response) => {
    const userEmail = request.body.email;
    const userPassword = request.body.password;
    console.log("post Requested...");
   
    // Check for empty fields
    if (checkEmptyFields(request.body)) {
        return response.status(400);
    }

    try {
        // Find the user in the database by email
        const user = await usersCollection.findOne({ email: userEmail });
        
        if (!user) {
            return response.status(404); // User not found
        }
        
        // Check if password matches
        if (user.password !== userPassword) {
            return response.status(401); // Unauthorized
        }
        
        // If everything is correct, redirect or send a success message
        return response.status(200).redirect('/todos');
    } catch (err) {
        console.error('Error finding user:', err);
        return response.status(500).send('Error logging in'); // Internal Server Error
    }
});

// Route to get user by email
app.post('/getUserByEmail', bodyParser.json(), async (req, res) => {
    const userEmail = req.body.email;

    try {
        // Find user by email
        const user = await usersCollection.findOne({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Route to update user's todos
app.post('/updateUserTodos', bodyParser.json(), async (req, res) => {
    const userEmail = req.body.email;
    const updatedTodos = req.body.todos;

    try {
        console.log('Update request received:', req.body); // Log the request payload

        // Update the user document in MongoDB with the new todos array
        const result = await usersCollection.updateOne({ email: userEmail }, { $set: { todos: updatedTodos } });

        console.log('Update result:', result); // Log the result of the update operation

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Todos updated successfully' });
    } catch (error) {
        console.error('Error updating todos:', error);
        res.status(500).json({ error: 'Failed to update todos' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Function to check for empty fields
function checkEmptyFields(fields) {
    for (let field in fields) {
        if (!fields[field]) {
            return true; // Field is empty
        }
    }
    return false; // No empty fields
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate password
function isPasswordValid(password, repeatPassword) {
    return password === repeatPassword && password.length > 8;
}

// Function to check if email already exists in the database
async function isExistEmail(email) {
    const existingUser = await usersCollection.findOne({ email: email });
    return existingUser !== null;
}

// Handle SIGINT signal to close MongoDB connection before exiting
process.on('SIGINT', () => {
    client.close();
    console.log('Disconnected from MongoDB');
    process.exit();
});
