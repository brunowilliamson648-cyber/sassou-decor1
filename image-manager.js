// Gestionnaire d'images pour Sassou Décor

class ImageManager {
    constructor() {
        this.storageKey = 'sassouProductImages';
        this.maxSize = 5 * 1024 * 1024; // 5MB
        this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    }
    
    // Vérifier si le localStorage a assez d'espace
    checkStorageSpace() {
        try {
            const images = this.getAllImages();
            const totalSize = this.calculateTotalSize(images);
            const availableSpace = 5 * 1024 * 1024; // Environ 5MB disponible dans la plupart des navigateurs
            
            return {
                used: totalSize,
                available: availableSpace - totalSize,
                percentage: (totalSize / availableSpace) * 100
            };
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'espace:', error);
            return { used: 0, available: 0, percentage: 0 };
        }
    }
    
    // Calculer la taille totale des images
    calculateTotalSize(images) {
        let total = 0;
        for (const [key, value] of Object.entries(images)) {
            if (value) {
                // Approximation de la taille en bytes (base64 est environ 33% plus grand)
                total += (value.length * 3) / 4;
            }
        }
        return total;
    }
    
    // Obtenir toutes les images
    getAllImages() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (error) {
            console.error('Erreur lors de la récupération des images:', error);
            return {};
        }
    }
    
    // Sauvegarder une image
    saveImage(fileName, imageData) {
        try {
            // Vérifier la taille
            const size = (imageData.length * 3) / 4; // Approximation
            if (size > this.maxSize) {
                throw new Error(`L'image est trop grande (${(size/1024/1024).toFixed(2)}MB). Maximum: 5MB`);
            }
            
            const images = this.getAllImages();
            images[fileName] = imageData;
            
            localStorage.setItem(this.storageKey, JSON.stringify(images));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'image:', error);
            return false;
        }
    }
    
    // Récupérer une image
    getImage(fileName) {
        const images = this.getAllImages();
        return images[fileName] || null;
    }
    
    // Supprimer une image
    deleteImage(fileName) {
        try {
            const images = this.getAllImages();
            delete images[fileName];
            localStorage.setItem(this.storageKey, JSON.stringify(images));
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image:', error);
            return false;
        }
    }
    
    // Compresser une image
    compressImage(imageData, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                
                // Calculer les nouvelles dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dessiner l'image compressée
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en base64 avec compression
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            
            img.onerror = reject;
            img.src = imageData;
        });
    }
    
    // Convertir un fichier en base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            // Vérifier le format
            if (!this.supportedFormats.includes(file.type)) {
                reject(new Error('Format de fichier non supporté'));
                return;
            }
            
            // Vérifier la taille
            if (file.size > this.maxSize) {
                reject(new Error('Fichier trop volumineux'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Exporter toutes les images (pour sauvegarde)
    exportImages() {
        const images = this.getAllImages();
        const dataStr = JSON.stringify(images);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `sassou-images-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Importer des images (pour restauration)
    importImages(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedImages = JSON.parse(e.target.result);
                    const currentImages = this.getAllImages();
                    
                    // Fusionner les images
                    const mergedImages = { ...currentImages, ...importedImages };
                    
                    // Sauvegarder
                    localStorage.setItem(this.storageKey, JSON.stringify(mergedImages));
                    resolve(mergedImages);
                } catch (error) {
                    reject(new Error('Fichier JSON invalide'));
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Créer une instance globale
window.imageManager = new ImageManager();