const express = require('express');
const ProductManager = require('../ProductManager');
const CartManager = require('../CartManager');

const productManager = new ProductManager();
const cartManager = new CartManager();

module.exports = (io) => {
  const router = express.Router();
  // Vista administrador de productos
//router.get('/adm-producto', async (req, res) => {
//  const productos = await productManager.cargarProductos();
//  res.render('adm-producto', { productos });
//});
// Crear producto
router.post('/adm-producto', async (req, res) => {
  const data = req.body;
  await productManager.agregarProducto(data);
  res.redirect('/adm-producto');
});
// Eliminar producto
router.post('/adm-producto/delete/:id', async (req, res) => {
  const id = req.params.id;
  await productManager.eliminarProducto(id);
  res.redirect('/adm-producto');
});
// Actualizar producto
router.post('/adm-producto/update/:id', async (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;

  await productManager.actualizarProducto(id, datosActualizados);
  res.redirect('/adm-producto');
});

router.get('/adm-producto', async (req, res) => {
  const productos = await productManager.cargarProductos();

  let productoEditado = null;
  const id = req.query.edit;
  if (id) {
    productoEditado = await productManager.obtenerProductoPorId(id);
  }

  res.render('adm-producto', {
    productos,
    producto: productoEditado // si existe, completa el formulario
  });
});





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
