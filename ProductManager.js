const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor(filePath = 'products.json') {
    this.filePath = path.join(__dirname, filePath);
    this.products = [];
  }

  async cargarProductos() {
    try {
      // Comprobar si el archivo existe, si no, crear uno vacío
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, '[]');
      }

      const data = await fs.readFile(this.filePath, 'utf-8');
      this.products = JSON.parse(data);
      return this.products;
    } catch (error) {
      console.error('Problemas al cargar productos:', error);
      this.products = [];
      return [];
    }
  }

  async guardarProductos() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.error('Error al guardar productos:', error);
    }
  }

  async agregarProducto(product) {
    product.id = Date.now().toString();
    this.products.push(product);
    await this.guardarProductos();
  }

  async eliminarProducto(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      await this.guardarProductos();
      return true;
    } else {
      return false;
    }
  }
}

module.exports = ProductManager;
