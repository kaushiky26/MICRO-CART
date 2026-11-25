# MicroCart

A small e-commerce demo built with microservices.

- **product-service** (port 5001): lists products
- **order-service** (port 5002): creates and lists orders, and asks the product service for product details
- **frontend** (port 5173): React app that talks to both services

Data is stored in memory, so it resets whenever a service restarts.

## Requirements

- Node.js 18 or newer
- npm

## How to run

Open three terminals in the project folder.

Terminal 1:

```
cd product-service
npm install
npm start
```

Terminal 2:

```
cd order-service
npm install
npm start
```

Terminal 3:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

The two indicators at the top of the page turn green when the services are running. They re-check every few seconds, so you can start the services in any order.

## API

Product service (http://localhost:5001)

| Method | Route | Description |
| --- | --- | --- |
| GET | /health | Service status |
| GET | /products | List products (optional `?q=search`) |
| GET | /products/:id | Get one product |

Order service (http://localhost:5002)

| Method | Route | Description |
| --- | --- | --- |
| GET | /health | Service status |
| GET | /orders | List orders and total revenue |
| GET | /orders/:id | Get one order |
| POST | /orders | Create an order with `productId` and `quantity` |
| PATCH | /orders/:id | Update order `status` |

## Project structure

```
ecommerce-microservices/
  frontend/
  product-service/
  order-service/
```

## Tech used

React, Vite, Node.js, Express
