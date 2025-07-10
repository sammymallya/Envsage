// const { type } = require("os")

const myForm = $('.login-form');
myForm.on('submit',function(event){
    event.preventDefault();
    const email  = $('#email').val();
    const password = $('#password').val();
    const postData = {
        email: email,
        password: password
    };
    const msg = $('.login_msg')

    fetch('http://localhost:3000/api/login', {
    method: 'POST', // Specify the HTTP method
    headers: {
        'Content-Type': 'application/json' // Set the content type
    },
    body: JSON.stringify(postData) // Send the data as a JSON string
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Post created:', data);
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        msg.toggle();
        console.error('Error creating post:', error);
    });
})