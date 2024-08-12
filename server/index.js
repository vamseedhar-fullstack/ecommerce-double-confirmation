const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const app = express();
const PORT = 3001;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});


app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());

const jwtSecretKey = 'yatayatismdnvlsvnvlefmv';

app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO rolebased (username, password, role) VALUES (?, ?, ?)';
      db.query(query, [username, hashedPassword, role], (err, result) => {
          if (err) {
              console.error('Error inserting data:', err); // Log the actual error
              res.status(500).json({ success: false, message: 'Error inserting data' });
          } else {
              res.json({ success: true, message: 'Login data saved successfully', role });
          }
      });
  } catch (error) {
      console.error('Error hashing password:', error); // Log the hashing error
      res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});



app.post('/loginn', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM rolebased WHERE username = ?`;

    db.query(query, [username], async (error, results) => {
        if (error) {
            res.status(500).json({ success: false, message: 'Database error' });
        } else if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const role = user.role;
                const token = jwt.sign({ username, role }, jwtSecretKey, { expiresIn: '30m' });
                res.cookie('token', token, { httpOnly: true });
                res.json({ success: true, role, token });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token.split(' ')[1], jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
}


app.get('/products', verifyToken, (req, res) => {
    const query = 'SELECT * FROM Ecom_Products';
    db.query(query, (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error fetching products' });
      } else {
        res.status(200).json(results);
      }
    });
  });



  app.post('/cart/add', (req, res) => {
    const { productId, username, quantity } = req.body;
    // Insert or update the product quantity in the shopping cart table in your database
    const sql = 'INSERT INTO ShoppingCart (username, productId, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?';
    db.query(sql, [username, productId, quantity, quantity], (error, result) => {
        if (error) {
            console.error('Error adding product to cart:', error);
            res.status(500).json({ success: false, message: 'Failed to add product to cart' });
        } else {
          updateTotalPrice(username);
            res.status(200).json({ success: true, message: 'Product added to cart successfully' });
        }
    });
  });
  


app.get('/cart', (req, res) => {
  const { username } = req.query;
  const query = `
    SELECT ShoppingCart.productId, ShoppingCart.quantity, Ecom_Products.caption, Ecom_Products.menimage,Ecom_Products.price,Ecom_Products.saleprice
    FROM ShoppingCart
    JOIN Ecom_Products ON ShoppingCart.productId = Ecom_Products.id
    WHERE ShoppingCart.username = ?
  `;
  db.query(query, [username], (error, results) => {
    if (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ success: false, message: 'Error fetching cart items' });
    } else {
      res.status(200).json(results);
    }
  });
});



// app.post('/cart/remove', (req, res) => {
//   const { productId, username} = req.body;
//   const sql = 'DELETE FROM ShoppingCart WHERE username = ? AND productId = ?';
//   db.query(sql, [username, productId], (error, result) => {
//       if (error) {
//           console.error('Error removing product from cart:', error);
//           res.status(500).json({ success: false, message: 'Failed to remove product from cart' });
//       } else {
//           // Update total price after removing item
//           updateTotalPrice(username);
//           res.status(200).json({ success: true, message: 'Product removed from cart successfully' });
//       }
//   });
// });


app.post('/cart/remove', (req, res) => {
  const { productId, username } = req.body;
  const deleteQuery = 'DELETE FROM ShoppingCart WHERE username = ? AND productId = ?';

  // First, remove the product from the cart
  db.query(deleteQuery, [username, productId], (error, deleteResult) => {
    if (error) {
      console.error('Error removing product from cart:', error);
      res.status(500).json({ success: false, message: 'Failed to remove product from cart' });
    } else {
      updateTotalPrice(username);

      // Check if the cart is empty for the user
      db.query('SELECT COUNT(*) AS cartCount FROM ShoppingCart WHERE username = ?', [username], (countError, countResult) => {
        if (countError) {
          console.error('Error checking cart count:', countError);
          res.status(500).json({ success: false, message: 'Error checking cart count' });
        } else {
          const cartCount = countResult[0].cartCount;
          if (cartCount === 0) {
            // If cart is empty, delete the row from ShoppingCartTotal
            const deleteTotalQuery = 'DELETE FROM ShoppingCartTotal WHERE username = ?';
            db.query(deleteTotalQuery, [username], (deleteTotalError, deleteTotalResult) => {
              if (deleteTotalError) {
                console.error('Error deleting total price:', deleteTotalError);
                res.status(500).json({ success: false, message: 'Error deleting total price' });
              } else {
                res.status(200).json({ success: true, message: 'Product removed from cart successfully and cart is empty, total price deleted' });
              }
            });
          } else {
            res.status(200).json({ success: true, message: 'Product removed from cart successfully' });
          }
        }
      });
    }
  });
});


app.post('/cart/update', (req, res) => {
  const { productId, quantity, username} = req.body;

  const updateQuery = 'UPDATE ShoppingCart SET quantity = ? WHERE username = ? AND productId = ?';
  db.query(updateQuery, [quantity, username, productId], (error, result) => {
      if (error) {
          console.error('Error updating item quantity in cart:', error);
          res.status(500).json({ success: false, message: 'Error updating item quantity in cart' });
      } else {
          // Update total price after updating quantity
          updateTotalPrice(username);
          res.status(200).json({ success: true, message: 'Item quantity updated successfully' });
      }
  });
});




function updateTotalPrice(username) {
  const tempTable = `(SELECT SUM(quantity * saleprice) as totalPrice
                      FROM ShoppingCart
                      JOIN Ecom_Products ON ShoppingCart.productId = Ecom_Products.id
                      WHERE ShoppingCart.username = ?) temp`;

  const updateTotalQuery = `
    INSERT INTO ShoppingCartTotal (username, totalPrice)
    SELECT ?, temp.totalPrice
    FROM ${tempTable}
    ON DUPLICATE KEY UPDATE totalPrice = temp.totalPrice
  `;

  return new Promise((resolve, reject) => {
    db.query(updateTotalQuery, [username, username], (error, result) => {
      if (error) {
        console.error('Error updating total price in cart:', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

app.get('/cart/total', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT * FROM ShoppingCartTotal WHERE username = ?';
  db.query(query, [username], (error, results) => {
    if (error) {
      console.error('Error fetching total price:', error);
      res.status(500).json({ success: false, message: 'Error fetching total price' });
    } else {
      res.status(200).json(results[0]); // Assuming only one total price per user
    }
  });
});

app.get('/adminpaymentconfirm', (req, res) => {
  const query = 'SELECT * FROM Orders';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching total price:', error);
      res.status(500).json({ success: false, message: 'Error fetching total price' });
    } else {
      res.status(200).json(results); 
    }
  });
});


app.post('/client/updateordersdata', (req, res) => {
  const { orderid, custmor_username, totalprice, paymentMethod} = req.body;
  
  const selectQuery = 'SELECT * FROM Orders WHERE orderid = ?';
  db.query(selectQuery, [orderid], (selectError, selectResults) => {
    if (selectError) {
      console.error('Error checking existing orderid:', selectError);
      res.status(500).json({ success: false, message: 'Error checking existing orderid' });
    } else {
      if (selectResults.length > 0) {
        res.status(200).json({ success: true, message: 'Order already exists' });
      } else {
        const insertQuery = 'INSERT INTO Orders (orderid, customer_username, totalPrice,PaymentMethod) VALUES (?, ?, ?,?)';
        db.query(insertQuery, [orderid,custmor_username, totalprice,paymentMethod], (insertError, insertResult) => {
          if (insertError) {
            console.error('Error adding payment confirmation:', insertError);
            res.status(500).json({ success: false, message: 'Error adding payment confirmation' });
          } else {
            res.status(200).json({ success: true, message: 'Payment confirmation added successfully' });
          }
        });
      }
    }
  });
});


app.post('/admin/updateordersdata', (req, res) => {
  const { orderid, adminusername} = req.body;

  // Check if the order has already been updated
  const checkQuery = 'SELECT admin_username FROM Orders WHERE orderid = ?';
  db.query(checkQuery, [orderid], (checkError, checkResult) => {
    if (checkError) {
      console.error('Error checking order status:', checkError);
      res.status(500).json({ success: false, message: 'Error checking order status' });
    } else {
      const existingAdminUsername = checkResult[0]?.admin_username;
      if (existingAdminUsername === adminusername) {
        res.status(400).json({ success: false, message: 'Order already updated by the same admin' });
      } else {
        // Update the order with the new admin username and products
        const updateQuery = 'UPDATE Orders SET admin_username=? WHERE orderid = ?';
        db.query(updateQuery, [adminusername, orderid], (updateError, updateResult) => {
          if (updateError) {
            console.error('Error adding payment confirmation:', updateError);
            res.status(500).json({ success: false, message: 'Error adding payment confirmation' });
          } else {
            res.status(200).json({ success: true, message: 'Payment confirmation added successfully' });
          }
        });
      }
    }
  });
});




app.post('/admin/updatepaymentstatus', (req, res) => {
  const { orderid, paymentStatus } = req.body;
  const updateQuery = 'UPDATE Orders SET 	paymentStatus = ? WHERE orderid = ?';
  db.query(updateQuery, [paymentStatus, orderid], (error, result) => {
    if (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Error updating payment status' });
    } else {
      res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    }
  });
});



app.get('/fetchpaymentstatus', (req, res) => {
  const { orderid } = req.query;
  const query = 'SELECT paymentStatus,cashondeliverystatus FROM Orders where orderid = ?';
  db.query(query,[orderid], (error, results) => {
    if (error) {
      console.error('Error fetching paymentStatus:', error);
      res.status(500).json({ success: false, message: 'Error fetching paymentStatus' });
    } else {
      res.status(200).json(results[0]); 
    }
  });
});

app.post('/cashondelivery', (req, res) => {
  const { orderid, paymentMethod, address, pincode } = req.body;  
  const updateQuery = 'UPDATE Orders SET paymentStatus = ?, paymentMethod = ?, address = ?, pincode = ? WHERE orderid = ?';
  
  db.query(updateQuery, ['Cash on Delivery', paymentMethod, address, pincode, orderid], (error, result) => {
    if (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Error updating payment status' });
    } else {
      res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    }
  });
});

app.post('/admin/cashondeliverystatus', (req, res) => {
  const { orderid, cashondeliverystatus } = req.body;
  const updateQuery = 'UPDATE Orders SET 	cashondeliverystatus = ? WHERE orderid = ?';
  db.query(updateQuery, [cashondeliverystatus, orderid], (error, result) => {
    if (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Error updating payment status' });
    } else {
      res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    }
  });
});

app.get('/admin/getpaymentstatus', (req, res) => {
  const { orderid } = req.query;
  const query = 'SELECT paymentStatus,address,pincode,paymentMethod FROM Orders WHERE orderid = ?';
  db.query(query, [orderid], (error, result) => {
    if (error) {
      console.error('Error fetching payment status:', error);
      res.status(500).json({ success: false, message: 'Error fetching payment status' });
    } else {
      if (result.length > 0) {
        const paymentStatus = result[0];
        res.status(200).json({ success: true, paymentStatus });
      } else {
        res.status(404).json({ success: false, message: 'Payment status not found for the order ID' });
      }
    }
  });
});

app.post('/order/confirmdelete', (req, res) => {
  const { custmor_username } = req.body;
  const deleteQuery = 'DELETE FROM ShoppingCart WHERE username = ?';
  db.query(deleteQuery, [custmor_username], (error, result) => {
    if (error) {
      console.error('Error deleting items from cart:', error);
      res.status(500).json({ success: false, message: 'Error deleting items from cart' });
    } else {
      db.query('SELECT COUNT(*) AS cartCount FROM ShoppingCart WHERE username = ?', [custmor_username], (countError, countResult) => {
        if (countError) {
          console.error('Error checking cart count:', countError);
          res.status(500).json({ success: false, message: 'Error checking cart count' });
        } else {
          const cartCount = countResult[0].cartCount;
          if (cartCount === 0) {
            db.query('DELETE FROM ShoppingCartTotal WHERE username = ?', [custmor_username], (deleteTotalError, deleteTotalResult) => {
              if (deleteTotalError) {
                console.error('Error deleting total price:', deleteTotalError);
                res.status(500).json({ success: false, message: 'Error deleting total price' });
              } else {
                res.status(200).json({ success: true, message: 'Order confirmed and cart items deleted, total price removed' });
              }
            });
          } else {
            res.status(200).json({ success: true, message: 'Order confirmed and cart items deleted' });
          }
        }
      });
    }
  });
});


app.get('/getallorders', (req, res) => {
  const { adminusername } = req.query;
  const query = 'SELECT * FROM Orders where admin_username=?';
  db.query(query,[adminusername], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching products' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/productsfromorders', (req, res) => {
  const { orderid } = req.query;
  const query = `
    SELECT allproducts from Orders where orderid = ?
  `;
  db.query(query, [orderid], (error, results) => {
    if (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ success: false, message: 'Error fetching cart items' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.post('/admin/updateproducts', (req, res) => {
  const { orderid, products } = req.body;
  const allProductsJSON = JSON.stringify(products); 

  const updateQuery = 'UPDATE Orders SET 	allproducts = ? WHERE orderid = ?';
  db.query(updateQuery, [allProductsJSON, orderid], (error, result) => {
    if (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Error updating payment status' });
    } else {
      res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    }
  });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});