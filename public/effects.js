// For AllCards.ejs 
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('#AProduct_card');
    let delay = 0;
  
    cards.forEach((card) => {
      card.style.animationDelay = `${delay}s`;
      delay += 0.2; // Adjust the delay between animations (0.2 seconds in this case)
    });
  });

  //For Index.ejs

// Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const customCards = document.querySelectorAll('.custom-card');
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'zoomInRotate 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is in view
    });
  
    customCards.forEach(card => {
      observer.observe(card);
    });
  });
  
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const custom2Cards = document.querySelectorAll('.custom2-card');
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is in view
    });
  
    custom2Cards.forEach(card => {
      observer.observe(card);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.item1 img');
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeIn 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is in view
    });
  
    items.forEach(item => {
      observer.observe(item);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const aboutTitle = document.querySelectorAll('.about-title, .about-text');
    const aboutImg = document.querySelector('.about-img');
    const aboutCards = document.querySelectorAll('.about-card');
  
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    };
  
    const observerOptions = {
      threshold: 0.1 // Trigger when 10% of the element is in view
    };
  
    const titleObserver = new IntersectionObserver(observerCallback, observerOptions);
    aboutTitle.forEach(title => {
      titleObserver.observe(title);
    });
  
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeIn 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    }, observerOptions);
  
    imgObserver.observe(aboutImg);
  
    const cardObserver = new IntersectionObserver(observerCallback, observerOptions);
    aboutCards.forEach(card => {
      cardObserver.observe(card);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('#img123');
    const smallerGridImages = document.querySelectorAll('#imgSM');
  
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeIn 1s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    };
  
    const observerOptions = {
      threshold: 0.1 // Trigger when 10% of the element is in view
    };
  
    const videoObserver = new IntersectionObserver(observerCallback, observerOptions);
    videoObserver.observe(video);
  
    const imageObserver = new IntersectionObserver(observerCallback, observerOptions);
    smallerGridImages.forEach(img => {
      img.style.animation = 'zoomIn 0.8s ease forwards';
      imageObserver.observe(img);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const cartItems = document.querySelectorAll('#CartCard');
  
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    };
  
    const observerOptions = {
      threshold: 0.1 // Trigger when 10% of the element is in view
    };
  
    const observer = new IntersectionObserver(observerCallback, observerOptions);
  
    cartItems.forEach(item => {
      observer.observe(item);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.querySelectorAll('#ProductCard .custom-card');
  
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    };
  
    const observerOptions = {
      threshold: 0.1 // Trigger when 10% of the element is in view
    };
  
    const observer = new IntersectionObserver(observerCallback, observerOptions);
  
    productCards.forEach(card => {
      observer.observe(card);
    });
  });
  // Add this to your custom.js or a new script file

document.addEventListener('DOMContentLoaded', function () {
    const productElements = document.querySelectorAll('#ProductCard .product2Image, #ProductCard .product-title, #ProductCard .product-price, #ProductCard .btn-container, #ProductCard .ProductDescription');
  
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
          observer.unobserve(entry.target); // Stop observing once the animation has played
        }
      });
    };
  
    const observerOptions = {
      threshold: 0.1 // Trigger when 10% of the element is in view
    };
  
    const observer = new IntersectionObserver(observerCallback, observerOptions);
  
    productElements.forEach(element => {
      observer.observe(element);
    });
  });
  