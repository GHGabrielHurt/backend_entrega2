const fs = require('fs').promises; 
const path = require('path');

class CartManager {
    constructor(filePath = 'carts.json') {
        this.filePath = path.join(__dirname, filePath);
        this.carts = []; 
    }


    async loadCarts() {
        try {
            // si existe el archivo
            await fs.access(this.filePath).catch(async () => {
                await fs.writeFile(this.filePath, '[]'); // crear archivo si no existe
            });
            const data = await fs.readFile(this.filePath, 'utf-8');
            this.carts = JSON.parse(data);
            return this.carts;
        } catch (error) {
            console.error('Problema al cargar carrito:', error);
            this.carts = [];
            return this.carts;
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.error('Error al guardar carritos:', error);
        }
    }

    async createCart() {
        const newCart = { id: Date.now().toString(), products: [] };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    getCartById(id) {
        return this.carts.find(c => c.id === id);
    }

async addProductToCart(cartId, productId) {
    await this.loadCarts(); 

    const cart = this.getCartById(cartId);
    console.log("cartc", cart, productId);
    if (!cart) return null;

    const productInCart = cart.products.find(p => p.productId === productId);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.products.push({ productId, quantity: 1 });
    }

    await this.saveCarts();
    return cart;
}
}


module.exports = CartManager;
