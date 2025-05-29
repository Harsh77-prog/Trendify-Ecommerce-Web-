// Array of background image URLs
const bgImages = [
    "https://images-eu.ssl-images-amazon.com/images/G/31/img23/GW/P42/Boult_3000x1200-PC._CB543542644_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img22/Wireless/devjyoti/GW/Uber/Nov/Nov_New_3000x1200._CB542180708_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/OHL_Events/img24/HSS/Dec24/3000x1200_PC2._CB540801550_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img21/MA2024/GW/BFCM/WA_Ethnic_PC_2X._CB540703489_.jpg", // Replace with actual URLs
    "https://images-eu.ssl-images-amazon.com/images/G/31/OHL/24/BAU/feb/PC_hero_1_2x_1._CB582889946_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img24/Beauty/TBSnov/Updated/New/COOP/BFCM24_GW_PC_Hero_lifestyle._CB540792835_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img22/Wireless/devjyoti/GW/Uber/Nov/Nov_New_3000x1200._CB542180708_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img23/GW/P42/Boult_3000x1200-PC._CB543542644_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img24/Media/BAU/PC_Hero_2x-toys_1._CB582765723_.jpg"
    
  ];
  
  let currentIndex = 0; // Track the current background image index
  
  const mainDiv = document.getElementById("main-div");
  
  // Function to show the previous background image
  function prevImage() {
    currentIndex = (currentIndex - 1 + bgImages.length) % bgImages.length;
    mainDiv.style.backgroundImage = `url(${bgImages[currentIndex]})`;
  }
  
  // Function to show the next background image
  function nextImage() {
    currentIndex = (currentIndex + 1) % bgImages.length;
    mainDiv.style.backgroundImage = `url(${bgImages[currentIndex]})`;
  }
  
  // Add event listeners to buttons
  document.getElementById("prev-btn").addEventListener("click", prevImage);
  document.getElementById("next-btn").addEventListener("click", nextImage);
  
  function toggleDetails(productId) {
    const detailsElement = document.getElementById(`details-${productId}`);
    if (detailsElement.style.display === "none" || detailsElement.style.display === "") {
      detailsElement.style.display = "block";
    } else {
      detailsElement.style.display = "none";
    }
  }

  // Function to add a product to the cart
  function addToCart(productId) {
    const quantity = 1; // Assuming default quantity is 1 for now
    
    // Send a POST request to add the product to the cart
    fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Product added to cart!');
          updateCartBadge(data.cartCount); // 💥 Update badge with the count
        } else {
          alert(data.message || 'Failed to add product to cart.');
        }
      }
      )
      .catch(error => {
        console.error('Error adding to cart:', error);
        alert('An error occurred while adding the product to the cart.');
      });
  }

  function updateCartBadge(count) {
    const cartCountElem = document.getElementById('cart-count');
    if (count > 0) {
      cartCountElem.textContent = count;
      cartCountElem.style.display = 'inline';
    } else {
      cartCountElem.style.display = 'none';
    }
  }
  
  
  

