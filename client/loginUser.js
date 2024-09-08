// Execute this code when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Clear sessionStorage and localStorage
    sessionStorage.clear();
    localStorage.clear();

    // Add event listener for login button click
    document.getElementById("loginBtn").addEventListener("click", async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get email and password from input fields
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        // Basic validation
        if (!email || !password) {
            alert("Please fill in both email and password fields.");
            return;
        }
        // Validate email format
        if (!isValidEmail(email)) {
            alert("Invalid email format. Please enter a valid email address.");
            return;
        }

        // Fetch user from the server to check if email exists
        try {
            const response = await fetch('/getUserByEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            const data = await response.json();
            if (response.ok && data) {
                // Check if password matches
                if (!isPasswordValid(data.password, password)) {
                    alert("Invalid password.");
                } else {
                    // Set userEmail in sessionStorage
                    sessionStorage.setItem("userEmail", email);
                    // Redirect to todos page
                    window.location.href = "/todos";
                }
            } else {
                alert("Email does not exist. Please register first.");
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            alert("Error checking email existence. Please try again later.");
        }
    });
});

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate password
function isPasswordValid(passwordOne, passwordTwo) {
    return passwordOne === passwordTwo && passwordOne.length >= 8;
}
