const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const fs = require('fs');
const ProductManager = require('./ProductManager');
const productManager = new ProductManager();
// Importar managers
const CartManager = require('./CartManager');
const cartManager = new CartManager();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

console.log('Arrancando servidor...');

const viewsPath = path.join(__dirname, 'views');
const productsView = path.join(viewsPath, 'products.hbs');

console.log('Archivo products.hbs existe?', fs.existsSync(productsView));

// Middleware básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesión
const sessionMiddleware = session({
  secret: 'clave-secreta-cualquiera',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // 10 minutos
});
app.use(sessionMiddleware);

// Compartir sesión con WebSocket
io.use(sharedSession(sessionMiddleware, {
  autoSave: true
}));

// Configurar Handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts')
}));
app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.post('/finalizar', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      //console.error('Error al destruir la sesión:', err);
      return res.status(500).send('Error al finalizar compra');
    }
    res.sendStatus(200);
  });
});



// Rutas
const productsRouter = require('./routes/products')(io);
const cartsRouter = require('./routes/carts')(io);
app.use('/', productsRouter);
app.use('/cart', cartsRouter);

// WebSockets
io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  const session = socket.handshake.session;

  // Crear carrito si no existe
  if (!session.cartId) {
    const nuevoCarrito = await cartManager.createCart();
    session.cartId = nuevoCarrito.id;
    session.save();
    console.log('Nuevo carrito creado con ID:', nuevoCarrito.id);
  }

socket.on('agregarProductoAlCarrito', async ({ productId }) => {
  const cartId = session.cartId;
  if (!cartId) return;

  await cartManager.addProductToCart(cartId, productId);
  
  const carritoActualizado = await cartManager.getCartById(cartId); //carrito completo

 
  const productosCompletos = await productManager.cargarProductos(); 

  carritoActualizado.products = carritoActualizado.products.map(p => {
    const prod = productManager.products.find(prod => prod.id === p.productId);
    return {
      title: prod?.title || 'Producto desconocido',
      price: prod?.price || 0,
      quantity: p.quantity,
      subtotal: (prod?.price || 0) * p.quantity
    };
  });

  const total = carritoActualizado.products.reduce((sum, p) => sum + p.subtotal, 0);
  carritoActualizado.total = total;

  // Emitir el carrito completo al cliente
  socket.emit('carritoActualizado', carritoActualizado);
  console.log(`Producto ${productId} agregado al carrito ${cartId}`);
});

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
