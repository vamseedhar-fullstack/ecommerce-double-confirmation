import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const token = Cookies.get("token");


  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      if (decoded.role !== "user") {
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products" , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    if (category === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category === category
      );
      setFilteredProducts(filtered);
    }
  };

  const addToCart = async (productId) => {
    const quantity = 1;
    try {
      await axios.post("http://localhost:3001/cart/add", {
        productId,
        username,
        quantity,
      });
      alert("Product added to cart");
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cart", {
        params: { username },
      });
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  return (
    <div className="product-container">
      <Link to="/cart">
        <button className="btn btn-primary">Cart {cartItems.length ? cartItems.length : ''}
  </button>
      </Link>
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
      <h1>Product List</h1>
      <div className="filter-section">
        <label htmlFor="categoryFilter">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="category-filter"
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>
      <div className="product-list">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-item">
            <img src={product.menimage} className="imageee" />
            <h3>{product.caption}</h3>
            <p className="category">Category: {product.category}</p>
            <p className="sale-price">Price: Rs.{product.price}</p>
            <p className="price">Sale Price: Rs.{product.saleprice}</p>
            <button
              className="add-to-cart-btn"
              onClick={() => addToCart(product.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
