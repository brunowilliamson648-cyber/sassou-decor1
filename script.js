// Données initiales des produits
let products = [
    {
        id: 1,
        name: "Bouquet de fleurs",
        price: 45.00,
        category: "mariage",
        image: "bouquet.jpg",
        description: "Magnifique bouquet de fleurs fraîches pour votre mariage"
    },
    {
        id: 2,
        name: "Robe de mariée",
        price: 350.00,
        category: "mariage",
        image: "robe-mariee.jpg",
        description: "Robe de mariée élégante et moderne"
    },
    {
        id: 3,
        name: "Pétrouque",
        price: 25.00,
        category: "accessoires",
        image: "petrouque.jpg",
        description: "Accessoire traditionnel pour la cérémonie"
    },
    {
        id: 4,
        name: "Chapeau élégant",
        price: 35.00,
        description: "Chapeau pour les invités ou la mariée",
        category: "accessoires",
        image: "chapeau.jpg"
    },
    {
        id: 5,
        name: "Décoration de table",
        price: 60.00,
        category: "decor",
        image: "decoration-table.jpg",
        description: "Ensemble de décoration pour table de réception"
    },
    {
        id: 6,
        name: "Robe de soirée",
        price: 120.00,
        category: "vetements",
        image: "robe-soiree.jpg",
        description: "Robe élégante pour soirée ou cérémonie"
    },
    {
        id: 7,
        name: "Chemise de cérémonie",
        price: 55.00,
        category: "vetements",
        image: "chemise.jpg",
        description: "Chemise élégante pour le marié ou les invités"
    },
    {
        id: 8,
        name: "Valise de voyage",
        price: 85.00,
        category: "accessoires",
        image: "valise.jpg",
        description: "Valise élégante pour le voyage de noces"
    }
];

// Panier
let cart = JSON.parse(localStorage.getItem('sassouCart')) || [];

// DOM chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les produits
    displayProducts(products);
    
    // Initialiser le panier
    updateCart();
    
    // Écouteurs pour les filtres
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
    
    // Écouteur pour le bouton admin
    document.getElementById('admin-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('admin-modal').style.display = 'flex';
    });
    
    // Écouteur pour fermer la modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('admin-modal').style.display = 'none';
    });
    
    // Fermer la modal en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('admin-modal')) {
            document.getElementById('admin-modal').style.display = 'none';
        }
    });
    
    // Écouteur pour le bouton de commande
    document.getElementById('checkout-btn').addEventListener('click', function() {
        if (cart.length === 0) {
            alert("Votre panier est vide. Ajoutez des produits avant de passer une commande.");
            return;
        }
        
        // Générer le message pour WhatsApp
        let message = "Bonjour Sassou Décor, je souhaite passer la commande suivante:%0A%0A";
        let total = 0;
        
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                message += `- ${product.name}: ${item.quantity} x $${product.price} = $${(product.price * item.quantity).toFixed(2)}%0A`;
                total += product.price * item.quantity;
            }
        });
        
        message += `%0ASous-total: $${total.toFixed(2)}%0A`;
        message += `Livraison: $10.00%0A`;
        message += `Total: $${(total + 10).toFixed(2)}%0A%0A`;
        message += `Nom: ________%0A`;
        message += `Adresse: ________%0A`;
        message += `Téléphone: ________%0A%0A`;
        message += `Je paierai via MonCash (+509 3490 2252).`;
        
        // Ouvrir WhatsApp avec le message
        window.open(`https://wa.me/50943373434?text=${message}`, '_blank');
    });
    
    // Charger les produits depuis le stockage local si disponible
    loadProductsFromStorage();
});

// Afficher les produits
function displayProducts(productsToDisplay) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<p class="no-products">Aucun produit disponible dans cette catégorie.</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Utiliser une image par défaut si l'image n'existe pas
        const imageSrc = product.image ? `images/${product.image}` : 'images/default-product.jpg';
        
        productCard.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}" class="product-img" onerror="this.src='images/default-product.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-category">${getCategoryName(product.category)}</span>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        `;
        
        container.appendChild(productCard);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Filtrer les produits par catégorie
function filterProducts(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

// Obtenir le nom de la catégorie
function getCategoryName(category) {
    const categories = {
        'mariage': 'Mariage',
        'decor': 'Décoration',
        'vetements': 'Vêtements',
        'accessoires': 'Accessoires'
    };
    return categories[category] || category;
}

// Ajouter au panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('sassouCart', JSON.stringify(cart));
    
    // Mettre à jour l'affichage du panier
    updateCart();
    
    // Animation de confirmation
    const button = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    button.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
    button.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
        button.style.backgroundColor = '';
    }, 1500);
}

// Mettre à jour le panier
function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    // Mettre à jour le compteur
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Mettre à jour la liste des articles
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        subtotalElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="images/${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='images/default-product.jpg'">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p class="cart-item-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" data-id="${product.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${product.id}">+</button>
                <button class="remove-item" data-id="${product.id}">Supprimer</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Mettre à jour les totaux
    const shipping = 10.00;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Ajouter les écouteurs d'événements pour les boutons de quantité
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

// Mettre à jour la quantité d'un article
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('sassouCart', JSON.stringify(cart));
    
    // Mettre à jour l'affichage
    updateCart();
}

// Retirer un article du panier
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('sassouCart', JSON.stringify(cart));
    
    // Mettre à jour l'affichage
    updateCart();
}

// Charger les produits depuis le stockage local
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('sassouProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        displayProducts(products);
    }
}

// Fonction pour l'admin pour sauvegarder les produits
function saveProductsToStorage() {
    localStorage.setItem('sassouProducts', JSON.stringify(products));
}// Bouton flottant pour ajouter un produit
document.getElementById('floating-add-btn').addEventListener('click', function() {
    document.getElementById('add-product-modal').style.display = 'flex';
    document.getElementById('add-product-password').value = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('password-step').style.display = 'block';
    document.getElementById('product-form-step').style.display = 'none';
});

// Fermer la modale d'ajout
document.getElementById('close-add-modal').addEventListener('click', function() {
    document.getElementById('add-product-modal').style.display = 'none';
    resetProductForm();
});

// Fermer en cliquant à l'extérieur
document.getElementById('add-product-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        document.getElementById('add-product-modal').style.display = 'none';
        resetProductForm();
    }
});

// Vérifier le mot de passe
document.getElementById('verify-password-btn').addEventListener('click', verifyPassword);

// Entrée pour vérifier le mot de passe
document.getElementById('add-product-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verifyPassword();
    }
});

// Bouton pour parcourir les images
document.getElementById('browse-btn').addEventListener('click', function() {
    document.getElementById('product-image-upload').click();
});

// Bouton pour prendre une photo (utilise l'appareil photo)
document.getElementById('camera-btn').addEventListener('click', function() {
    // Créer un input file avec capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Pour l'appareil photo arrière
    
    input.onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };
    
    input.click();
});

// Gérer l'upload d'image
document.getElementById('product-image-upload').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0]);
    }
});

// Sauvegarder le nouveau produit
document.getElementById('save-new-product-btn').addEventListener('click', saveNewProduct);

// Annuler l'ajout de produit
document.getElementById('cancel-add-product-btn').addEventListener('click', function() {
    document.getElementById('add-product-modal').style.display = 'none';
    resetProductForm();
});

// Fonction pour vérifier le mot de passe
function verifyPassword() {
    const passwordInput = document.getElementById('add-product-password');
    const errorMsg = document.getElementById('password-error');
    const enteredPassword = passwordInput.value;
    
    // Mot de passe par défaut (vous pouvez le changer)
    const correctPassword = localStorage.getItem('sassouAddPassword') || "sassou123";
    
    if (enteredPassword === correctPassword) {
        // Afficher le formulaire d'ajout
        document.getElementById('password-step').style.display = 'none';
        document.getElementById('product-form-step').style.display = 'block';
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = 'Mot de passe incorrect. Veuillez réessayer.';
        passwordInput.focus();
    }
}

// Fonction pour gérer l'upload d'image
function handleImageUpload(file) {
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('L\'image est trop grande. Taille maximum: 5MB', 'error');
        return;
    }
    
    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showNotification('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.', 'error');
        return;
    }
    
    // Afficher la barre de progression
    document.getElementById('upload-progress').style.display = 'block';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = 'Chargement de l\'image...';
    
    // Simuler une progression
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 50);
    
    // Lire l'image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        clearInterval(progressInterval);
        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('progress-text').textContent = 'Image chargée avec succès!';
        
        // Afficher l'aperçu
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Aperçu">`;
        
        // Stocker l'image temporairement
        imagePreview.dataset.imageData = e.target.result;
        
        // Masquer la barre de progression après 1 seconde
        setTimeout(() => {
            document.getElementById('upload-progress').style.display = 'none';
        }, 1000);
    };
    
    reader.onerror = function() {
        clearInterval(progressInterval);
        showNotification('Erreur lors du chargement de l\'image', 'error');
        document.getElementById('upload-progress').style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

// Fonction pour sauvegarder un nouveau produit
function saveNewProduct() {
    // Récupérer les valeurs du formulaire
    const name = document.getElementById('product-name-input').value.trim();
    const price = parseFloat(document.getElementById('product-price-input').value);
    const category = document.getElementById('product-category-select').value;
    const description = document.getElementById('product-description-input').value.trim();
    const imageData = document.getElementById('image-preview').dataset.imageData;
    
    // Validation
    if (!name || !price || price <= 0 || !imageData) {
        showNotification('Veuillez remplir tous les champs obligatoires (nom, prix et image)', 'error');
        return;
    }
    
    // Générer un ID unique
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Générer un nom de fichier unique
    const fileName = `product-${Date.now()}.jpg`;
    
    // Ajouter le produit au tableau
    products.push({
        id: newId,
        name,
        price,
        category,
        image: fileName,
        description: description || `Produit ${name} de qualité`
    });
    
    // Sauvegarder l'image dans le localStorage
    saveImageToStorage(fileName, imageData);
    
    // Sauvegarder les produits dans le localStorage
    saveProductsToStorage();
    
    // Afficher une notification de succès
    showNotification('Produit ajouté avec succès!', 'success');
    
    // Mettre à jour l'affichage
    displayProducts(products);
    
    // Réinitialiser le formulaire
    resetProductForm();
    
    // Fermer la modale après 1.5 secondes
    setTimeout(() => {
        document.getElementById('add-product-modal').style.display = 'none';
    }, 1500);
}

// Fonction pour sauvegarder une image dans le localStorage
function saveImageToStorage(fileName, imageData) {
    try {
        // Créer un objet pour stocker les images
        let storedImages = JSON.parse(localStorage.getItem('sassouProductImages')) || {};
        
        // Stocker l'image
        storedImages[fileName] = imageData;
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('sassouProductImages', JSON.stringify(storedImages));
        
        console.log(`Image ${fileName} sauvegardée dans le localStorage`);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'image:', error);
        showNotification('Erreur lors de la sauvegarde de l\'image', 'error');
    }
}

// Fonction pour récupérer une image depuis le localStorage
function getImageFromStorage(fileName) {
    try {
        const storedImages = JSON.parse(localStorage.getItem('sassouProductImages')) || {};
        return storedImages[fileName] || null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image:', error);
        return null;
    }
}

// Fonction pour afficher les images depuis le localStorage
function displayLocalStorageImages() {
    try {
        const storedImages = JSON.parse(localStorage.getItem('sassouProductImages')) || {};
        const imageCount = Object.keys(storedImages).length;
        
        // Afficher un message d'information
        const infoElement = document.querySelector('.local-storage-info');
        if (infoElement) {
            infoElement.textContent = `${imageCount} image(s) stockée(s) localement`;
        }
        
        return Object.keys(storedImages);
    } catch (error) {
        console.error('Erreur lors de l\'affichage des images:', error);
        return [];
    }
}

// Fonction pour réinitialiser le formulaire
function resetProductForm() {
    document.getElementById('product-name-input').value = '';
    document.getElementById('product-price-input').value = '';
    document.getElementById('product-category-select').value = 'mariage';
    document.getElementById('product-description-input').value = '';
    
    const imagePreview = document.getElementById('image-preview');
    imagePreview.innerHTML = '<i class="fas fa-image"></i><p>Aperçu de l\'image apparaîtra ici</p>';
    imagePreview.dataset.imageData = '';
    
    document.getElementById('upload-progress').style.display = 'none';
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Modifier la fonction displayProducts pour utiliser les images du localStorage
function displayProducts(productsToDisplay) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<p class="no-products">Aucun produit disponible dans cette catégorie.</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Essayer de récupérer l'image depuis le localStorage
        let imageSrc = 'images/default-product.jpg';
        
        if (product.image) {
            const storedImage = getImageFromStorage(product.image);
            if (storedImage) {
                imageSrc = storedImage; // Utiliser l'image du localStorage
            } else if (product.image.startsWith('data:image')) {
                imageSrc = product.image; // Utiliser l'image en base64
            } else {
                imageSrc = `images/${product.image}`; // Utiliser le chemin d'accès
            }
        }
        
        productCard.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}" class="product-img" onerror="this.onerror=null; this.src='images/default-product.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-category">${getCategoryName(product.category)}</span>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        `;
        
        container.appendChild(productCard);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Mettre à jour la fonction de chargement des produits
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('sassouProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        displayProducts(products);
    }
    
    // Afficher les informations sur les images stockées
    displayLocalStorageImages();
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    // ... code existant ...
    
    // Charger les produits et images
    loadProductsFromStorage();
});