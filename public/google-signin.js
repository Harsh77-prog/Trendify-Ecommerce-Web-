// Callback function to handle the credential response
function handleCredentialResponse(response) {

  // Send the ID token to your backend to verify the user
  fetch('/auth/google/callback', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: response.credential }), // Send the ID token to the backend
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Authentication failed');
      }
      return response.json();
  })
  .then(data => {
      // Redirect to the home page after successful authentication
      window.location.href = '/home'; // Redirect to the home page
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

// Initialize the Google Sign-In button and configure OAuth
window.onload = function () {
  google.accounts.id.initialize({
      client_id: '871822031113-ho69r854nh02adqpvne2q5ganld1hj9u.apps.googleusercontent.com', // Your OAuth Client ID
      callback: handleCredentialResponse // The callback function to handle the Google login response
  });

  // Render the Google Sign-In button with custom styles
  google.accounts.id.renderButton(
      document.getElementById("google-signin-button"), 
      { 
          theme: "outline", 
          size: "large" 
      }
  );
}
