import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const Adminprodectdetails = () => {
  const [products, setproducts] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const custmor_username = searchParams.get("username");
  const totalprice = searchParams.get("totalPrice");
  const orderid = searchParams.get("orderid");
  const [paymentReceivedConfirmationOpen, setPaymentReceivedConfirmationOpen] = useState(false);
  const [ paymentNotReceivedConfirmationOpen,setPaymentNotReceivedConfirmationOpen,] = useState(false);
  const [adminPaymentCalled, setAdminPaymentCalled] = useState(false);
  const [confirmCashOnDeliveryOpen, setConfirmCashOnDeliveryOpen] =useState(false);
  const [cashOnDeliveryAction, setCashOnDeliveryAction] = useState("");
  const [orderConfirmationLoading, setOrderConfirmationLoading] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
    } else {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      if (decoded.role !== "admin") {
        navigate("/");
      }
    }
  }, [navigate]);
  

  useEffect(() => {
    if (username && !adminPaymentCalled) {
      fetchproducts();
      getPaymentStatus();
      setAdminPaymentCalled(true);
    }
  }, [username, adminPaymentCalled]);

  useEffect(() => {
    if (products.length > 0) {
      adminpayments();
    }
  }, [products]);

  const fetchproducts = async () => {
    const username = custmor_username;
    try {
      const response = await axios.get("http://localhost:3001/cart", {
        params: { username },
      });
      if (response.data.length === 0) {
        await fetchproductsfromorders();
      } else {
        setproducts(response.data);
        console.log("/cart",response.data )
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchproductsfromorders = async () => {
    try {
      const response = await axios.get("http://localhost:3001/productsfromorders", {
        params: { orderid },
      });
  
      const responseData = response.data.map(item => {
        const parsedData = JSON.parse(item.allproducts);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData; // Return the entire array of products
        }
        return null; // Handle empty or invalid data
      }).filter(item => item !== null); // Filter out null values
  
      const allProducts = responseData.flat(); // Flatten the nested arrays
      setproducts(allProducts);
      console.log("/productsfromorders", allProducts);
      console.log("/direct data", response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };
  
  
    
   
  const adminpayments = async () => {
    try {
      await axios.post("http://localhost:3001/admin/updateordersdata", {
        orderid,
        adminusername:username,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  useEffect(() => {
    if (orderid) {
      const intervalId = setInterval(getPaymentStatus, 1000);
      return () => clearInterval(intervalId);
    }
  }, [orderid]);

  const getPaymentStatus = async () => {
    if(orderid){
      try {
        const response = await axios.get(
          "http://localhost:3001/admin/getpaymentstatus",
          {
            params: { orderid },
          }
        );
        setPaymentStatus(response.data.paymentStatus);
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    }
  };

  const updatePaymentStatus = async (paymentStatus) => {
    try {
      await axios.post("http://localhost:3001/admin/updatepaymentstatus", {
        orderid,
        paymentStatus,
      });
      fetchproducts();
      
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const cashondeliverystatus = async (cashondeliverystatus) => {
    try {
      await axios.post("http://localhost:3001/admin/cashondeliverystatus", {
        orderid,
        cashondeliverystatus,
      });
      fetchproducts();
      if (cashondeliverystatus === "Confirm Order") {
        handleConfirmOrderdelete();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleConfirmOrderdelete = async () => {
    try {
      setOrderConfirmationLoading(true);
      const response = await axios.post(
        "http://localhost:3001/order/confirmdelete",
        {
          orderid,
          custmor_username,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error confirming order:", error);
    } finally {
      setOrderConfirmationLoading(false);
      navigate("/adminorderslist");
    }
  };

  const handleConfirmPaymentReceived = () => {
    setPaymentReceivedConfirmationOpen(true);
  };

  const handleConfirmPaymentNotReceived = () => {
    setPaymentNotReceivedConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setPaymentReceivedConfirmationOpen(false);
    setPaymentNotReceivedConfirmationOpen(false);
  };

  const handleConfirmReceived = () => {
    updatePaymentStatus("Payment Received");
    setPaymentReceivedConfirmationOpen(false);
    if (paymentStatus.paymentMethod === "upi") {
      handleConfirmOrderdelete();
    }
    navigate('/adminorderslist')
  };

  const handleConfirmNotReceived = () => {
    updatePaymentStatus("Payment Not Received");
    setPaymentNotReceivedConfirmationOpen(false);
  };

  const handleConfirmCashOnDelivery = async (action) => {
    setCashOnDeliveryAction(action);
    setConfirmCashOnDeliveryOpen(true);
    try {
      await axios.post("http://localhost:3001/admin/updateproducts", {
        orderid,
        products,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const handleConfirmCashOnDeliveryClose = () => {
    setConfirmCashOnDeliveryOpen(false);
  };

  const handleConfirmCashOnDeliveryAction = () => {
    cashondeliverystatus(cashOnDeliveryAction);
    setConfirmCashOnDeliveryOpen(false);
  };

  return (
    <div
      className="d-flex flex-row justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="text-center">
        <div className="cart-items d-flex gap-3">
          {products.map((item) => (
            <div key={item.productId} className="cart-item">
              <img src={item.menimage} className="imageee" alt="Product" />
              <h3>{item.caption}</h3>
              <p>Quantity: {item.quantity}</p>
              <p className="sale-price">Price: Rs.{item.saleprice}</p>
            </div>
          ))}
        </div>
        <br />
        <br />
        {paymentStatus.paymentMethod ===  "cash" ? (
          <>
            <h4 className="paymentstatus">Cash on Delivery Status</h4>
            <div>
              <p>Address: {paymentStatus.address}</p>
              <p>Pincode: {paymentStatus.pincode}</p>
              <b>Total : {totalprice}</b>
            </div>
            <button
              className="btn btn-success"
              onClick={() => handleConfirmCashOnDelivery("Confirm Order")}
            >
              Confirm Order
            </button>
            <button
              className="btn btn-danger"
              style={{ marginLeft: "20px" }}
              onClick={() => handleConfirmCashOnDelivery("Reject Order")}
            >
              Reject Order
            </button>
            {orderConfirmationLoading && <p>Confirming order...</p>}
          </>
        ) : (
          <>
            {paymentStatus.paymentMethod === "upi" && (
              <>
                <h4 className="paymentstatus">UPI Payment Status</h4>
                <p>Total : {totalprice}</p>
                <button
                  className="btn btn-success"
                  onClick={handleConfirmPaymentReceived}
                >
                  Payment Received
                </button>
                <button
                  className="btn btn-danger"
                  style={{ marginLeft: "20px" }}
                  onClick={handleConfirmPaymentNotReceived}
                >
                  Payment Not Received
                </button>
              </>
            )}
          </>
        )}

        <Dialog
          open={paymentReceivedConfirmationOpen}
          onClose={handleConfirmationClose}
        >
          <DialogTitle>Confirm Payment Received</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to confirm the payment as received?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmationClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmReceived} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={paymentNotReceivedConfirmationOpen}
          onClose={handleConfirmationClose}
        >
          <DialogTitle>Confirm Payment Not Received</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to confirm the payment as not received?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmationClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmNotReceived} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmCashOnDeliveryOpen}
          onClose={handleConfirmCashOnDeliveryClose}
        >
          <DialogTitle>
            {cashOnDeliveryAction === "Confirm Order"
              ? "Confirm Order"
              : "Reject Order"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {cashOnDeliveryAction === "Confirm Order"
                ? "Are you sure you want to confirm this order?"
                : "Are you sure you want to reject this order?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmCashOnDeliveryClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmCashOnDeliveryAction} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
