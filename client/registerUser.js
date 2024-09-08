const form = document.querySelector("[data-form]");
// Execute this code when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Check if user is already logged in
    if (sessionStorage.getItem("userEmail")) {
        window.location.href = "/todos"; // Redirect to todos page
    }
    localStorage.clear();

    // Add event listener for sign-up button click
    document.getElementById("SignUp").addEventListener("click", async function(event) {
        // Get form input values
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var repeatPassword = document.getElementById("repeatPassword").value;
        var username = document.getElementById("username").value;

        // Basic validation
        if (!email || !password || !repeatPassword || !username) {
            alert("One or more fields are empty");
            event.preventDefault();
            return;
        }
        if (!isValidEmail(email)) {
            alert("Invalid email format. Please enter a valid email address.");
            event.preventDefault();
            return;
        }
        if (!isPasswordValid(password, repeatPassword)) {
            alert("Password must be at least 8 characters long and match the repeated password");
            event.preventDefault();
            return;
        }
        if (await isDuplicateEmail(email)) {
            alert("Email already exists");
              event.preventDefault();
            return;
        }
        
        // Redirect to login page
        window.location.href = "/login"; 
    });
});

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
async function isDuplicateEmail(email) {
    try {
        const response = await fetch('/getUserByEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            throw new Error('Failed to check email');
        }

        const data = await response.json();
        return data !== null;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
}
