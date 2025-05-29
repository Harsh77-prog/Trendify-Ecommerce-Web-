document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const closeModal = document.getElementById('close-modal');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
  
    // Show modal on button click
    forgotPasswordBtn.addEventListener('click', () => {
      forgotPasswordModal.style.display = 'block';
    });
  
    // Hide modal on close button click
    closeModal.addEventListener('click', () => {
      forgotPasswordModal.style.display = 'none';
    });
  
    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
      const email = document.getElementById('forgot-email').value;
  
      try {
        // Make an API request to the server to handle the forgot-password logic
        const response = await fetch('/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
  
        const result = await response.text();
  
        if (response.ok) {
          alert(result); // Notify user
          forgotPasswordModal.style.display = 'none'; // Close the modal
        } else {
          alert(result); // If error is returned from the server
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.'); // Show error if fetch fails
      }
    });
  });
  