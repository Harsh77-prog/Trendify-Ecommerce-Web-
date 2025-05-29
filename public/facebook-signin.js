// facebook-login.js
window.fbAsyncInit = function () {
  FB.init({
    appId: '448224624764815', // Replace with your App ID
    cookie: true, // Enable cookies to allow the server to access the session
    xfbml: true, // Parse social plugins on this page
    version: 'v15.0', // Specify the Facebook API version
  });

  FB.AppEvents.logPageView(); // Log page view for analytics
};

function facebookLogin() {
  FB.login(
    function (response) {
      if (response.authResponse) {
        console.log('Successfully logged in', response);

        // Redirect to the Facebook auth endpoint
        window.location.href = '/auth/facebook';
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    },
    { scope: 'public_profile,email' } // Request the user’s public profile and email address
  );
}

// Load the Facebook SDK asynchronously
(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');
