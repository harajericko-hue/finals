document.addEventListener("DOMContentLoaded", () => {

    // --- PRODUCT DATA DB ---
    const PRODUCTS = [
        {
            id: 1,
            brand: "Louis Vuitton",
            name: "Pacific Chill",
            price: 185.00,
            image: "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2023%2F05%2Flouis-vuitton-pacific-chill-fragrance-release-info-000.jpg?w=960&cbr=1&q=90&fit=max",
            featured: true,
            badge: "Best Seller"
        },
        {
            id: 2,
            brand: "Jean Paul Gaultier",
            name: "Le Beau EDP",
            price: 210.00,
            image: "https://rustans.com/cdn/shop/products/jean_paul_gaultier-_0011_2468195-4.jpg?v=1627006585&width=1400",
            featured: true,
            badge: null
        },
        {
            id: 3,
            brand: "Giorgio Armani",
            name: "Profondo",
            price: 195.00,
            image: "https://priveperfumes.com/cdn/shop/files/perfume-giorgio-armani-acqua-di-gio-profondo-edt-m-50-ml-3-prive-perfumes.webp?v=1783852116&width=1440",
            featured: true,
            badge: null
        },
        {
            id: 4,
            brand: "SundayStaples",
            name: "Santal Sunday",
            price: 165.00,
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
            featured: false,
            badge: "New"
        },
        {
            id: 5,
            brand: "Byredo",
            name: "Gypsy Water",
            price: 200.00,
            image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
            featured: false,
            badge: null
        }
    ];

    // --- CART STATE ---
    let cart = [];

    // --- DOM ELEMENTS ---
    const homeFeaturedGrid = document.getElementById("home-featured-grid");
    const fullStoreGrid = document.getElementById("full-store-grid");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const cartCountBadges = document.querySelectorAll(".count");
    
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");

    // --- RENDER PRODUCTS ---
    function createProductCard(product) {
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.brand}</h3>
                    <p class="product-notes">${product.name}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Bag</button>
                </div>
            </div>
        `;
    }

    function renderGrids() {
        // Render Featured items on Home
        const featuredProducts = PRODUCTS.filter(p => p.featured);
        homeFeaturedGrid.innerHTML = featuredProducts.map(p => createProductCard(p)).join('');

        // Render All items on Store Page
        fullStoreGrid.innerHTML = PRODUCTS.map(p => createProductCard(p)).join('');

        // Re-attach listeners dynamically for newly rendered buttons
        attachAddToCartListeners();
    }

    // --- NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll("[data-page-target]");
    const pages = document.querySelectorAll(".page-section");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetPageId = item.getAttribute("data-page-target") + "-page";
            
            // Toggle active styling on Header buttons
            navItems.forEach(btn => btn.classList.remove("active"));
            const matchingHeaderBtns = document.querySelectorAll(`.container [data-page-target="${item.getAttribute("data-page-target")}"]`);
            matchingHeaderBtns.forEach(btn => btn.classList.add("active"));

            // Switch dynamic SPA sections
            pages.forEach(page => {
                if(page.id === targetPageId) {
                    page.classList.add("active");
                } else {
                    page.classList.remove("active");
                }
            });

            // Auto scroll to top of page on switch
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    // --- CART DRAWER OPEN / CLOSE ---
    function toggleCart() {
        cartDrawer.classList.toggle("active");
        cartOverlay.classList.toggle("active");
    }

    openCartBtn.addEventListener("click", toggleCart);
    closeCartBtn.addEventListener("click", toggleCart);
    cartOverlay.addEventListener("click", toggleCart);

    // --- CART FUNCTIONAL CORE LOGIC ---
    function attachAddToCartListeners() {
        const btns = document.querySelectorAll(".add-to-cart");
        btns.forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                addToCart(id);
            });
        });
    }

    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        updateCartUI();
        toggleCart(); // Slide cart drawer open immediately on add
    }

    function updateCartUI() {
        // Calculate Total Quantities
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountBadges.forEach(badge => badge.textContent = totalItems);

        // Render Cart Items HTML
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your bag is currently empty.</p>`;
            cartTotalPrice.textContent = "$0.00";
            return;
        }

        let cartHTML = "";
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${item.brand}</h4>
                        <p class="cart-item-variant">${item.name}</p>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-controls">
                            <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                            <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        cartTotalPrice.textContent = `$${subtotal.toFixed(2)}`;

        // Attach listeners inside the dynamic cart list
        attachCartControlsListeners();
    }

    function attachCartControlsListeners() {
        // Increase quantity
        document.querySelectorAll(".inc-qty").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                const item = cart.find(item => item.id === id);
                item.quantity++;
                updateCartUI();
            });
        });

        // Decrease quantity
        document.querySelectorAll(".dec-qty").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                const item = cart.find(item => item.id === id);
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(item => item.id !== id);
                }
                updateCartUI();
            });
        });

        // Remove item entirely
        document.querySelectorAll(".remove-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
            });
        });
    }

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById("contact-form");
    const successMsg = document.getElementById("form-success-message");

    if(contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            contactForm.style.display = "none";
            successMsg.style.display = "block";
            
            // Clean up inputs
            contactForm.reset();
            
            // Revert back after 5 seconds to let them send another message
            setTimeout(() => {
                successMsg.style.display = "none";
                contactForm.style.display = "block";
            }, 5000);
        });
    }

    // --- NEWSLETTER FORM SUBMISSION ---
    const newsletterForm = document.getElementById("newsletter-form");
    if(newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector("input").value;
            alert(`Scent mail unlocked. Thank you for signing up with: ${email}`);
            newsletterForm.reset();
        });
    }

    // --- INITIALIZE WEBPAGE ---
    renderGrids();
});