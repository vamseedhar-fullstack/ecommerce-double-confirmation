import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link,useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
      console.log("1st nav")
    } else {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      if (decoded.role !== "user") {
        navigate("/");
        console.log("2nd nav")
      }
      console.log("decoded.username",decoded.username)
    }
  }, [navigate]);

  useEffect(() => {
    if(username){
      fetchCartItems();
    }
  }, [username]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cart", {
        params: { username },
      });
      setCartItems(response.data);

      // Calculate total price when cart items are fetched
      const total = response.data.reduce(
        (acc, item) => acc + item.saleprice * item.quantity,
        0
      );
      setTotalPrice(total);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const removeFromCart = async (productId, saleprice) => {
    try {
      await axios.post("http://localhost:3001/cart/remove", {
        productId,
        username,
        saleprice,
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };
  
  const updateQuantity = async (productId, quantity, saleprice) => {
    try {
      const token = Cookies.get("token");
      if (token) {
        await axios.post("http://localhost:3001/cart/update", {
          productId,
          quantity,
          username,
          saleprice,
        });
        fetchCartItems(); // Refresh cart items after updating quantity
      }
    } catch (error) {
      console.error("Error updating quantity in cart:", error);
    }
  };
  

  return (
    <div className="cart-container">
      <Link to="/user">
        <button className="btn btn-primary">Home</button>
      </Link>
      {cartItems.length !== 0 ? (
        <Link to="/checkout">
              <button class="btn btn-dark " style={{marginLeft:"20px"}}>Checkout Rs.{Math.floor(totalPrice)}</button>
        </Link>
      ):('')}
     
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        
          <div className="cart-items d-flex gap-3">
          
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <img src={item.menimage} className="imageee" />
                <h3>{item.caption}</h3>
                <p>Quantity: {item.quantity}</p>
                <p className="price">Price: Rs.{item.price}</p>
                <p className="sale-price">Sale Price: Rs.{item.saleprice}</p>
                <button onClick={() => removeFromCart(item.productId)}>
                  Remove
                </button>
                <br />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, parseInt(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
       
      )}
    </div>
  );
};

export default Cart;
