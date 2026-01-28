// Mot de passe admin (par défaut: "admin123")
let adminPassword = localStorage.getItem('sassouAdminPassword') || "admin123";

// Écouteurs d'événements pour l'admin
document.addEventListener('DOMContentLoaded', function() {
    // Écouteur pour la connexion admin
    document.getElementById('login-btn').addEventListener('click', adminLogin);
    
    // Écouteur pour la touche Entrée dans le champ mot de passe
    document.getElementById('admin-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adminLogin();
        }
    });
    
    // Écouteurs pour les boutons admin
    document.getElementById('add-product-btn').addEventListener('click', showProductForm);
    document.getElementById('refresh-products-btn').addEventListener('click', refreshAdminProducts);
    document.getElementById('change-password-btn').addEventListener('click', showPasswordChangeForm);
    document.getElementById('save-product-btn').addEventListener('click', saveProduct);
    document.getElementById('cancel-product-btn').addEventListener('click', cancelProductForm);
    document.getElementById('save-password-btn').addEventListener('click', saveNewPassword);
    document.getElementById('cancel-password-btn').addEventListener('click', cancelPasswordChange);
});

// Connexion admin
function adminLogin() {
    const passwordInput = document.getElementById('admin-password');
    const errorMsg = document.getElementById('login-error');
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === adminPassword) {
        // Afficher le panneau admin
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        // Charger la liste des produits
        loadAdminProducts();
        
        // Effacer le champ mot de passe
        passwordInput.value = '';
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = 'Mot de passe incorrect. Veuillez réessayer.';
        passwordInput.focus();
    }
}

// Afficher le formulaire d'ajout de produit
function showProductForm() {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('password-change-form').style.display = 'none';
    
    // Réinitialiser le formulaire
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = 'mariage';
    document.getElementById('product-image').value = '';
    document.getElementById('product-description').value = '';
    
    // Changer le texte du bouton en "Ajouter"
    document.getElementById('save-product-btn').textContent = 'Ajouter le produit';
    document.getElementById('save-product-btn').dataset.mode = 'add';
}

// Charger les produits pour l'admin
function loadAdminProducts() {
    const container = document.getElementById('admin-products-list');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>Aucun produit disponible. Ajoutez votre premier produit.</p>';
        return;
    }
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'admin-product-item';
        productItem.innerHTML = `
            <div>
                <h4>${product.name}</h4>
                <p>Catégorie: ${getCategoryName(product.category)} | Prix: $${product.price.toFixed(2)}</p>
                <small>Image: ${product.image || 'aucune'}</small>
            </div>
            <div class="admin-product-actions">
                <button class="edit-product" data-id="${product.id}">Modifier</button>
                <button class="delete-product" data-id="${product.id}">Supprimer</button>
            </div>
        `;
        
        container.appendChild(productItem);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

// Rafraîchir la liste des produits
function refreshAdminProducts() {
    loadAdminProducts();
}

// Modifier un produit
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Remplir le formulaire avec les données du produit
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-description').value = product.description || '';
    
    // Changer le texte du bouton en "Modifier"
    document.getElementById('save-product-btn').textContent = 'Modifier le produit';
    document.getElementById('save-product-btn').dataset.mode = 'edit';
    document.getElementById('save-product-btn').dataset.productId = productId;
    
    // Afficher le formulaire
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('password-change-form').style.display = 'none';
}

// Supprimer un produit
function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    // Supprimer le produit du tableau
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        
        // Sauvegarder les produits
        saveProductsToStorage();
        
        // Recharger la liste
        loadAdminProducts();
        
        // Mettre à jour l'affichage des produits sur la page principale
        if (typeof displayProducts === 'function') {
            displayProducts(products);
        }
        
        alert('Produit supprimé avec succès.');
    }
}

// Sauvegarder un produit (ajout ou modification)
function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const mode = document.getElementById('save-product-btn').dataset.mode;
    
    // Validation
    if (!name || !price || price <= 0) {
        alert('Veuillez remplir tous les champs obligatoires (nom et prix valide).');
        return;
    }
    
    if (mode === 'add') {
        // Ajouter un nouveau produit
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        
        products.push({
            id: newId,
            name,
            price,
            category,
            image: image || 'default-product.jpg',
            description
        });
        
        alert('Produit ajouté avec succès.');
    } else if (mode === 'edit') {
        // Modifier un produit existant
        const productId = parseInt(document.getElementById('save-product-btn').dataset.productId);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                name,
                price,
                category,
                image: image || products[productIndex].image,
                description
            };
            
            alert('Produit modifié avec succès.');
        }
    }
    
    // Sauvegarder les produits
    saveProductsToStorage();
    
    // Recharger la liste
    loadAdminProducts();
    
    // Mettre à jour l'affichage des produits sur la page principale
    if (typeof displayProducts === 'function') {
        displayProducts(products);
    }
    
    // Masquer le formulaire
    cancelProductForm();
}

// Annuler le formulaire produit
function cancelProductForm() {
    document.getElementById('product-form').style.display = 'none';
}

// Afficher le formulaire de changement de mot de passe
function showPasswordChangeForm() {
    document.getElementById('password-change-form').style.display = 'block';
    document.getElementById('product-form').style.display = 'none';
    
    // Réinitialiser les champs
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Sauvegarder le nouveau mot de passe
function saveNewPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!newPassword || !confirmPassword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('Le mot de passe doit contenir au moins 4 caractères.');
        return;
    }
    
    // Mettre à jour le mot de passe
    adminPassword = newPassword;
    localStorage.setItem('sassouAdminPassword', adminPassword);
    
    alert('Mot de passe changé avec succès.');
    cancelPasswordChange();
}

// Annuler le changement de mot de passe
function cancelPasswordChange() {
    document.getElementById('password-change-form').style.display = 'none';
}// Afficher les informations de stockage
function displayStorageInfo() {
    const storageInfo = imageManager.checkStorageSpace();
    const infoElement = document.getElementById('storage-info');
    
    if (infoElement) {
        infoElement.innerHTML = `
            <div class="local-storage-info">
                <i class="fas fa-database"></i>
                <strong>Stockage local:</strong> 
                ${(storageInfo.used / 1024 / 1024).toFixed(2)}MB utilisés sur 5MB 
                (${storageInfo.percentage.toFixed(1)}%)
            </div>
        `;
    }
}

// Gestion des images dans l'admin
function setupImageManagement() {
    // Afficher la galerie d'images
    displayImageGallery();
    
    // Afficher les infos de stockage
    displayStorageInfo();
    
    // Bouton pour exporter les images
    const exportBtn = document.getElementById('export-images-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            imageManager.exportImages();
            showNotification('Images exportées avec succès!', 'success');
        });
    }
    
    // Bouton pour importer des images
    const importBtn = document.getElementById('import-images-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                if (e.target.files[0]) {
                    try {
                        await imageManager.importImages(e.target.files[0]);
                        showNotification('Images importées avec succès!', 'success');
                        displayImageGallery();
                        displayStorageInfo();
                    } catch (error) {
                        showNotification('Erreur lors de l\'importation: ' + error.message, 'error');
                    }
                }
            };
            
            input.click();
        });
    }
}

// Afficher la galerie d'images
function displayImageGallery() {
    const galleryElement = document.getElementById('image-gallery');
    if (!galleryElement) return;
    
    const images = imageManager.getAllImages();
    const imageKeys = Object.keys(images);
    
    if (imageKeys.length === 0) {
        galleryElement.innerHTML = '<p>Aucune image stockée localement</p>';
        return;
    }
    
    let galleryHTML = '<div class="admin-gallery">';
    
    imageKeys.forEach((key, index) => {
        galleryHTML += `
            <div class="gallery-item" data-image="${key}">
                <img src="${images[key]}" alt="Image ${index + 1}">
                <small>${key}</small>
            </div>
        `;
    });
    
    galleryHTML += '</div>';
    galleryElement.innerHTML = galleryHTML;
    
    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            const imageName = this.getAttribute('data-image');
            
            // Pré-remplir le formulaire avec cette image
            if (document.getElementById('product-image-url')) {
                document.getElementById('product-image-url').value = imageName;
                showNotification(`Image "${imageName}" sélectionnée`, 'success');
            }
        });
    });
}

// Initialiser la gestion des images
document.addEventListener('DOMContentLoaded', function() {
    // ... code existant ...
    
    // Initialiser la gestion des images
    setupImageManagement();
});