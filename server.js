const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes

// Initialize SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create products table and populate with sample data
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    
    // Check if we need to populate sample data
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('Error checking products:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('Populating database with sample products...');
        populateSampleData();
      }
    });
  });
}

// Sample data for initial population
function populateSampleData() {
  const sampleProducts = [
    { name: 'Spinning Reel 3000', description: 'High-quality spinning reel with smooth drag system', quantity: 25, price: 89.99, category: 'Reels' },
    { name: 'Baitcasting Reel', description: 'Professional baitcasting reel for bass fishing', quantity: 18, price: 149.99, category: 'Reels' },
    { name: 'Graphite Fishing Rod 7ft', description: 'Medium action graphite rod for freshwater', quantity: 30, price: 69.99, category: 'Rods' },
    { name: 'Telescopic Fishing Rod', description: 'Portable telescopic rod, extends to 6ft', quantity: 22, price: 45.99, category: 'Rods' },
    { name: 'Braided Fishing Line 300yd', description: '20lb test braided line, high strength', quantity: 45, price: 24.99, category: 'Lines & Leaders' },
    { name: 'Monofilament Line 250yd', description: '12lb test clear mono line', quantity: 60, price: 12.99, category: 'Lines & Leaders' },
    { name: 'Soft Plastic Lure Kit', description: 'Assorted soft plastic worms and grubs', quantity: 75, price: 19.99, category: 'Lures' },
    { name: 'Crankbait Set', description: 'Set of 5 diving crankbaits in various colors', quantity: 40, price: 29.99, category: 'Lures' },
    { name: 'Spinnerbait Pack', description: 'Pack of 3 spinnerbaits for bass', quantity: 35, price: 22.99, category: 'Lures' },
    { name: 'Fishing Tackle Box', description: 'Large multi-compartment tackle box', quantity: 28, price: 39.99, category: 'Tackle Storage' },
    { name: 'Waterproof Tackle Bag', description: 'Premium waterproof tackle bag with multiple pockets', quantity: 20, price: 79.99, category: 'Tackle Storage' },
    { name: 'Fishing Hooks Assortment', description: '200-piece assorted fishing hooks', quantity: 50, price: 15.99, category: 'Terminal Tackle' },
    { name: 'Fishing Weights Set', description: 'Assorted sinkers and weights', quantity: 55, price: 14.99, category: 'Terminal Tackle' },
    { name: 'Fishing Pliers', description: 'Stainless steel fishing pliers with line cutter', quantity: 32, price: 24.99, category: 'Tools & Accessories' },
    { name: 'Digital Fish Scale', description: 'Digital scale up to 110lb capacity', quantity: 25, price: 34.99, category: 'Tools & Accessories' },
    { name: 'Landing Net', description: 'Collapsible landing net with rubber mesh', quantity: 20, price: 44.99, category: 'Nets' },
    { name: 'Fishing Hat with UV Protection', description: 'Wide-brim fishing hat, UPF 50+', quantity: 40, price: 19.99, category: 'Apparel' },
    { name: 'Polarized Sunglasses', description: 'Sport polarized sunglasses for fishing', quantity: 30, price: 49.99, category: 'Apparel' },
    { name: 'Fishing Vest', description: 'Multi-pocket fishing vest with rod holder', quantity: 15, price: 59.99, category: 'Apparel' },
    { name: 'Live Bait Bucket', description: 'Insulated bait bucket with aerator', quantity: 18, price: 29.99, category: 'Live Bait' }
  ];

  const stmt = db.prepare('INSERT INTO products (name, description, quantity, price, category) VALUES (?, ?, ?, ?, ?)');
  
  sampleProducts.forEach(product => {
    stmt.run(product.name, product.description, product.quantity, product.price, product.category);
  });
  
  stmt.finalize(() => {
    console.log('Sample data populated successfully!');
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, quantity, price, category } = req.body;
  
  if (!name || quantity === undefined || price === undefined) {
    res.status(400).json({ error: 'Name, quantity, and price are required' });
    return;
  }
  
  db.run(
    'INSERT INTO products (name, description, quantity, price, category) VALUES (?, ?, ?, ?, ?)',
    [name, description, quantity, price, category],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, name, description, quantity, price, category });
    }
  );
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  const { name, description, quantity, price, category } = req.body;
  
  if (!name || quantity === undefined || price === undefined) {
    res.status(400).json({ error: 'Name, quantity, and price are required' });
    return;
  }
  
  db.run(
    'UPDATE products SET name = ?, description = ?, quantity = ?, price = ?, category = ? WHERE id = ?',
    [name, description, quantity, price, category, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ id: req.params.id, name, description, quantity, price, category });
    }
  );
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
