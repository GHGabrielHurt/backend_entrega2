const express = require('express');
const CartManager = require('../CartManager');
const ProductManager = require('../ProductManager');

const cartManager = new CartManager();
const productManager = new ProductManager();

module.exports = (io) => {
  const router = express.Router();

  // Ruta para mostrar el carrito por ID
  router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;

    await cartManager.loadCarts();
    await productManager.cargarProductos();

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }

    // Preparar productos con detalles para mostrar en la vista
    const productosDetalle = cart.products.map(item => {
      const producto = productManager.products.find(p => p.id === item.productId);
      return {
        title: producto ? producto.title : 'Producto no encontrado',
        quantity: item.quantity
      };
    });

    res.render('cart', { cartId: cid, productos: productosDetalle });
  });

  return router;
};
