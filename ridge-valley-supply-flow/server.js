const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});

// Apply rate limiting to auth routes
app.use('/api/auth', limiter);

// Logging middleware
app.use(morgan('combined'));

// Configure CORS with environment variables
const corsOptions = {
  origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or no token provided'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// File paths for data storage
const USERS_FILE = path.join(__dirname, 'users.json');
const INVENTORY_FILE = path.join(__dirname, 'inventory.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const WAREHOUSES_FILE = path.join(__dirname, 'warehouses.json');

// Load data from files with retry mechanism
async function loadData(file, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await fs.readFile(file, 'utf8');
      const parsedData = JSON.parse(data);
      return file === USERS_FILE ? (parsedData.users || []) : parsedData;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Failed to load ${file} after ${retries} attempts:`, error);
        return [];
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Save data to files with retry mechanism
async function saveData(file, data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const content = file === USERS_FILE ? { users: data } : data;
      await fs.writeFile(file, JSON.stringify(content, null, 2));
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Failed to save ${file} after ${retries} attempts:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Initialize data with proper error handling
let users = [];
let inventory = [];
let products = [];
let warehouses = [];

async function initializeData() {
  try {
    [users, inventory, products, warehouses] = await Promise.all([
      loadData(USERS_FILE),
      loadData(INVENTORY_FILE),
      loadData(PRODUCTS_FILE),
      loadData(WAREHOUSES_FILE)
    ]);
    console.log('Data loaded successfully');
  } catch (error) {
    console.error('Failed to initialize data:', error);
    process.exit(1);
  }
}

// Authentication middleware with proper error handling
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        code: 'NO_TOKEN',
        message: 'Authentication token required'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_HEADER',
        message: 'Invalid authorization header format'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
          error: err.message
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    console.log('Signup attempt received:', { username, role });
    
    // Validate input
    if (!username || !password) {
      console.log('Signup failed: Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Validate username format
    if (username.includes(' ')) {
      console.log('Signup failed: Username contains spaces');
      return res.status(400).json({ message: 'Username cannot contain spaces' });
    }
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
      console.log('Signup failed: User already exists for username:', username);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: Date.now().toString(),
      username: username.trim(), // Ensure username is trimmed
      password: hashedPassword,
      role: (role || 'customer').trim() // Ensure role is trimmed and default to customer
    };

    users.push(user);
    await saveData(USERS_FILE, { users });

    console.log('User created successfully:', { username: user.username, role: user.role });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt received:', { username });

    // Validate input
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Current users in database:', users.map(u => ({ username: u.username, role: u.role })));

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('Login failed: User not found for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password...');

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Login failed: Invalid password for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password valid, generating token...');

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    console.log('Login successful for user:', user.username);
    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Inventory Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const { search, warehouse, lowStock } = req.query;
    
    let filteredInventory = [...inventory];
    
    if (search) {
      filteredInventory = filteredInventory.filter(item => 
        item.product?.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product?.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (warehouse) {
      filteredInventory = filteredInventory.filter(item => 
        item.warehouseId === warehouse
      );
    }
    
    if (lowStock === 'true') {
      filteredInventory = filteredInventory.filter(item => 
        item.quantityOnHand <= item.reorderPoint
      );
    }
    
    res.json(filteredInventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

app.get('/api/inventory/:id', async (req, res) => {
  try {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Error fetching inventory item' });
  }
});

app.post('/api/inventory/intake', async (req, res) => {
  try {
    const { productId, warehouseId, quantity, uom } = req.body;
    
    if (!productId || !warehouseId || !quantity || !uom) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const existingItem = inventory.find(
      item => item.productId === productId && item.warehouseId === warehouseId
    );
    
    if (existingItem) {
      existingItem.quantityOnHand += quantity;
      await saveData(INVENTORY_FILE, inventory);
      return res.json(existingItem);
    }
    
    const newItem = {
      id: Date.now().toString(),
      productId,
      warehouseId,
      quantityOnHand: quantity,
      uom,
      reorderPoint: 0, // Default reorder point
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    await saveData(INVENTORY_FILE, inventory);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error recording inventory intake:', error);
    res.status(500).json({ message: 'Error recording inventory intake' });
  }
});

app.post('/api/inventory/deplete', async (req, res) => {
  try {
    const { productId, warehouseId, quantity } = req.body;
    
    if (!productId || !warehouseId || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const item = inventory.find(
      i => i.productId === productId && i.warehouseId === warehouseId
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    if (item.quantityOnHand < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity' });
    }
    
    item.quantityOnHand -= quantity;
    item.updatedAt = new Date().toISOString();
    
    await saveData(INVENTORY_FILE, inventory);
    res.json(item);
  } catch (error) {
    console.error('Error recording inventory depletion:', error);
    res.status(500).json({ message: 'Error recording inventory depletion' });
  }
});

// Products Routes
app.get('/api/products', async (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, defaultUom, description, price } = req.body;
    
    if (!name || !sku || !defaultUom) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newProduct = {
      id: Date.now().toString(),
      name,
      sku,
      defaultUom,
      description,
      price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await saveData(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove the product
    products.splice(index, 1);
    await saveData(PRODUCTS_FILE, products);
    
    // Also remove any inventory records associated with this product
    const inventoryIndexes = inventory.reduce((acc, item, index) => {
      if (item.productId === productId) {
        acc.push(index);
      }
      return acc;
    }, []);
    
    // Remove items from the end to avoid index shifting issues
    for (let i = inventoryIndexes.length - 1; i >= 0; i--) {
      inventory.splice(inventoryIndexes[i], 1);
    }
    
    await saveData(INVENTORY_FILE, inventory);
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Warehouses Routes
app.get('/api/warehouses', async (req, res) => {
  try {
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Error fetching warehouses' });
  }
});

app.post('/api/warehouses', async (req, res) => {
  try {
    const { name, location } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newWarehouse = {
      id: Date.now().toString(),
      name,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    warehouses.push(newWarehouse);
    await saveData(WAREHOUSES_FILE, warehouses);
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: 'Error creating warehouse' });
  }
});

app.delete('/api/warehouses/:id', authenticateToken, async (req, res) => {
  try {
    const warehouseId = req.params.id;
    console.log('Attempting to delete warehouse with ID:', warehouseId);
    console.log('Current warehouses:', JSON.stringify(warehouses, null, 2));
    
    // Find the warehouse by ID
    const warehouse = warehouses.find(w => w.id === warehouseId);
    
    if (!warehouse) {
      console.log('Warehouse not found. Available IDs:', warehouses.map(w => w.id));
      return res.status(404).json({ 
        message: 'Warehouse not found',
        availableIds: warehouses.map(w => w.id)
      });
    }
    
    console.log('Found warehouse:', warehouse);
    
    // Remove the warehouse
    const index = warehouses.findIndex(w => w.id === warehouseId);
    warehouses.splice(index, 1);
    await saveData(WAREHOUSES_FILE, warehouses);
    console.log('Warehouse removed from warehouses array');
    
    // Also remove any inventory records associated with this warehouse
    const inventoryIndexes = inventory.reduce((acc, item, index) => {
      if (item.warehouseId === warehouseId) {
        acc.push(index);
      }
      return acc;
    }, []);
    
    console.log('Found inventory records to delete:', inventoryIndexes.length);
    
    // Remove items from the end to avoid index shifting issues
    for (let i = inventoryIndexes.length - 1; i >= 0; i--) {
      inventory.splice(inventoryIndexes[i], 1);
    }
    
    await saveData(INVENTORY_FILE, inventory);
    console.log('Inventory records removed and data saved');
    
    res.status(200).json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ 
      message: 'Error deleting warehouse',
      error: error.message 
    });
  }
});

// Apply error handling middleware last
app.use(errorHandler);

// Initialize data before starting the server
initializeData().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 