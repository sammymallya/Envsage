const myForm = $('.login-form');
myForm.on("submit",function(event){
    event.preventDefault();
    const username = $('#signup-username').val();
    const email = $('#signup-email').val();
    const password = $('#signup-password').val();
    const cpassword = $('#signup-confirm-password').val();
    
    const postData = {
        name: username,
        email: email,
        password: password,
        cpassword: cpassword
    };
    fetch("http://localhost:3000/api/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Use .text() because backend sends a string, not JSON
    })
    .then(data => {
        console.log('User created:', data);
        window.location.href = 'login.html';
    })
    .catch(error => {
        // Show error to user
        console.error('Error adding user:', error);
    });
})
