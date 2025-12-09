# FishGear Pro - Fishing Gear Inventory Management System

A modern, easy-to-use web application for managing fishing gear inventory for retail stores. Built with Node.js, Express, and SQLite.

## Features

- 🎣 Browse and view all fishing gear products
- ➕ Add new products with details (name, description, price, quantity, category)
- ✏️ Edit existing products
- 🗑️ Delete products
- 📊 Real-time inventory statistics
- 💾 Local SQLite database with 20 pre-populated fishing gear products
- 🎨 Modern, responsive UI design with fishing-themed styling

## Product Categories

The system comes pre-loaded with fishing gear across various categories:
- **Rods** - Fishing rods of various types
- **Reels** - Spinning and baitcasting reels
- **Lines & Leaders** - Fishing lines and leader materials
- **Lures** - Artificial lures and baits
- **Terminal Tackle** - Hooks, weights, and other terminal gear
- **Tackle Storage** - Tackle boxes and bags
- **Tools & Accessories** - Pliers, scales, and other tools
- **Nets** - Landing nets
- **Apparel** - Fishing clothing and protective gear
- **Live Bait** - Live bait containers and accessories

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/juharokkanen-stack/varasto.git
cd varasto
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The application will automatically create a SQLite database (`inventory.db`) with 20 sample fishing gear products on first run.

## Project Structure

```
varasto/
├── server.js           # Express server and API endpoints
├── public/            # Frontend files
│   ├── index.html    # Main HTML page
│   ├── styles.css    # CSS styling (fishing-themed)
│   └── app.js        # Frontend JavaScript
├── package.json      # Node.js dependencies
└── README.md         # This file
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Modern, responsive CSS with CSS Grid and Flexbox

## License

ISC