# E-commerce Application

## Overview

This e-commerce application allows users to add products to their cart and proceed to checkout. The application features a client-side UI for managing products, a checkout process, and an admin panel for order management. When a user checks out, an order request is sent to the admin panel, where the admin can accept or reject the order. The user receives real-time updates on their order status based on the admin's decision.

## Features

- **Product Management**: Users can browse products and add them to their cart.
- **Cart Management**: Users can view and manage items in their cart.
- **Checkout Process**: Users can proceed to checkout and place orders.
- **Admin Panel**: Admins can view and manage incoming orders, with the ability to accept or reject them.
- **Real-Time Updates**: Users receive UI updates based on the admin's decision regarding their orders.

## Technologies Used

- **Frontend**: React.js for building the user interface.
- **Backend**: Node.js with Express.js for handling API requests and order management.
- **Database**: MySQL for storing product and order data.
- **Styling**: Bootstrap for responsive and attractive design.

## Installation

### Prerequisites

- Node.js
- MySQL

### Client Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/vamseedhar-fullstack/ecommerce-double-confirmation.git
    cd client
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```plaintext
    REACT_APP_API_URL=http://localhost:5000/api
    ```

4. Start the client application:
    ```bash
    npm start
    ```

### Server Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repository/server.git
    cd server
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```plaintext
    DB_HOST=your-database-host
    DB_USER=your-database-username
    DB_PASSWORD=your-database-password
    DB_DATABASE=your-database-name
    ```

4. Start the server:
    ```bash
    npm start
    ```

## Usage

1. **Adding Products**: Navigate to the product page and add items to the cart.
2. **Checking Out**: Proceed to the checkout page and submit your order.
3. **Admin Management**: Access the admin panel to view and manage orders. Accept or reject orders as needed.

## Contributing

If you'd like to contribute to the project, please fork the repository and create a pull request with your changes. Ensure that your code adheres to the existing coding style and includes relevant tests.


