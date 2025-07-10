const profileForm = $('.profile-form');

profileForm.on("submit", async function(event) {
    event.preventDefault();
    $('#loader-overlay').css('display', 'flex'); // Show loader overlay
    const obj = {
        name: $('#name').val(),
        age: $('#age').val(),
        gender: $('#gender').val(),
        location: $('#location').val(),
        education: $('#education').val(),
        future_education: $('#future-education').val(),
        skills: $('#skills').val(),
        hobbies: $('#hobbies').val(),
        interests: $('#interests').val(),
        personality: $('#personality').val(),
        goals: $('#goals').val()
    };
    try {
        const res = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj),
        });
        // Redirect to career_path.html as soon as data is received
        window.location.href = 'career_path.html';
    } catch (err) {
        $('#loader-overlay').hide(); // Hide loader on error
        console.error('Error submitting form:', err);
    }
});