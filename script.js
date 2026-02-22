// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Hero Carousel
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Auto-advance hero carousel
setInterval(() => {
    currentSlide++;
    showSlide(currentSlide);
}, 5000);

// Categories Carousel
const categoriesTrack = document.querySelector('.categories-track');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

if (prevBtn && nextBtn && categoriesTrack) {
    let scrollAmount = 0;
    
    nextBtn.addEventListener('click', () => {
        categoriesTrack.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
    
    prevBtn.addEventListener('click', () => {
        categoriesTrack.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });
}

// Countdown Timer
function updateCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    countdownElements.forEach(countdown => {
        const hours = countdown.querySelector('.countdown-item:nth-child(1) .countdown-value');
        const minutes = countdown.querySelector('.countdown-item:nth-child(2) .countdown-value');
        const seconds = countdown.querySelector('.countdown-item:nth-child(3) .countdown-value');
        
        if (hours && minutes && seconds) {
            let h = parseInt(hours.textContent);
            let m = parseInt(minutes.textContent);
            let s = parseInt(seconds.textContent);
            
            s--;
            
            if (s < 0) {
                s = 59;
                m--;
            }
            
            if (m < 0) {
                m = 59;
                h--;
            }
            
            if (h < 0) {
                h = 23;
            }
            
            hours.textContent = h.toString().padStart(2, '0');
            minutes.textContent = m.toString().padStart(2, '0');
            seconds.textContent = s.toString().padStart(2, '0');
        }
    });
}

setInterval(updateCountdown, 1000);

// Add to Cart functionality
const addToCartButtons = document.querySelectorAll('.btn-add-cart');
const cartCount = document.querySelector('.cart-count');
let cartItems = 0;

addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        cartItems++;
        cartCount.textContent = cartItems;
        
        // Add animation
        button.textContent = 'Added!';
        button.style.background = 'var(--accent-color)';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.background = '';
        }, 1500);
    });
});

// Quick View functionality
const quickViewButtons = document.querySelectorAll('.quick-view');

quickViewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        alert(`Quick view for: ${productName}\n\nThis would open a modal with product details.`);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Sticky header on scroll
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// Product card hover effects
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(-4px)';
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('SportsPro website loaded successfully!');
    
    // Add fade-in animation to sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
