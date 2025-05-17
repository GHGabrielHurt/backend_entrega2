const express = require('express');
const ProductManager = require('../ProductManager');
const CartManager = require('../CartManager');

const productManager = new ProductManager();
const cartManager = new CartManager();

module.exports = (io) => {
  const router = express.Router();

  // Ruta para mostrar productos y crear carrito si no existe
  router.get('/', async (req, res) => {
    await productManager.cargarProductos();

    // Crear carrito si no existe en la sesión
    if (!req.session.cartId) {
      await cartManager.loadCarts();
      const nuevoCarrito = await cartManager.createCart(); // Debe devolver el carrito o su ID
      req.session.cartId = nuevoCarrito.id || nuevoCarrito;
    }

    const productos = productManager.products;
const carrito = await cartManager.getCartById(req.session.cartId);
   
res.render('products', {
      products: productos,
      cart: carrito,
      cartId: req.session.cartId
    });
  });

  return router;
};
