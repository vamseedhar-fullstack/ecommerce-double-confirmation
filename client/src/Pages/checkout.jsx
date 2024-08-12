import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import paymentsuccessful from "../images/payment succsuss.jpg";
import paymentunsuccessful from "../images/Paymentfailed.png";
import cashrejected from "../images/round-rejected-stamp-png.png";
import cashapproved from "../images/cashconfirm.gif";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Link,useNavigate } from "react-router-dom";


const Checkout = () => {
  const [totatcartdetails, settotatcartdetails] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const payeeAddress = "7893386055@ybl";
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [orderid, setorderid] = useState("");
  const [paymentstatus, setpaymentstatus] = useState("");
  const [totalprice, settotalprice] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [cashondeliverystatus, setcashondeliverystatus] = useState("");
  const [displaycashondeliverystatus, setdisplaycashondeliverystatus] =
    useState(false);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(() => {
      const token = Cookies.get("token");
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

  useEffect(() => {
    if(username){
      fetchCartItems();
    }
  }, [username]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cart/total", {
        params: { username },
      });
      const totatcartdetails = response.data;
      settotatcartdetails(totatcartdetails);
      setorderid(totatcartdetails.order_id);
      settotalprice(totatcartdetails.totalPrice);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const upiPaymentLink = `upi://pay?pa=${payeeAddress}&pn=${username}&tn=Payment for Products&am=${totatcartdetails.totalPrice}&cu=INR`;

  useEffect(() => {
    if (orderid) {
      const intervalId = setInterval(fetchpaymentstatus, 1000);
      return () => clearInterval(intervalId);
    }
  }, [orderid]);

  const fetchpaymentstatus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/fetchpaymentstatus",
        {
          params: { orderid },
        }
      );
      const fetchpaymentstatus = response.data;
      setpaymentstatus(fetchpaymentstatus.paymentStatus);
      setcashondeliverystatus(fetchpaymentstatus.cashondeliverystatus);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const updatePaymentStatus = async (paymentStatus) => {
    try {
      await axios.post("http://localhost:3001/admin/updatepaymentstatus", {
        orderid,
        paymentStatus,
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleRetryPayment = () => {
    updatePaymentStatus("pending");
  };

  const handlePaymentCompletion = async () => {
    adminpayments();
    updatePaymentStatus("upi");
    if (paymentMethod === "cash") {
      updatePaymentStatus("Cash on Delivery");
    } else {
      if (paymentstatus === "Payment Not Received") {
        setPaymentCompleted(false);
        setpaymentstatus("pending");
      } else {
        setPaymentCompleted(true);
      }
    }
  };

  const handleSubmitCashOnDelivery = async () => {
    try {
      await adminpayments();
      await updatePaymentStatus("Cash on Delivery");
      await axios.post("http://localhost:3001/cashondelivery", {
        orderid,
        paymentMethod,
        address,
        pincode,
      });
      fetchCartItems();
      setdisplaycashondeliverystatus(true);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const adminpayments = async () => {
    try {
      await axios.post("http://localhost:3001/client/updateordersdata", {
        orderid,
        custmor_username:username,
        totalprice,
        paymentMethod
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div
      className="d-flex flex-row justify-content-center align-items-start mt-3"
      style={{ height: "100vh" }}
    >
      <div className="text-center">
        <h2>orderid: {totatcartdetails.order_id}</h2>
        <h2>Total Price: {totatcartdetails.totalPrice}</h2>
        <p>payment status: {paymentstatus}</p>
        <div>
          <input
            type="radio"
            id="cashOnDelivery"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => handlePaymentMethodChange("cash")}
          />
          <label htmlFor="cashOnDelivery">Cash on Delivery</label>
        </div>

        <div>
          <input
            type="radio"
            id="upiPayment"
            name="paymentMethod"
            value="upi"
            checked={paymentMethod === "upi"}
            onChange={() => handlePaymentMethodChange("upi")}
          />
          <label htmlFor="upiPayment">UPI Payment</label>
        </div>

        {paymentMethod === "cash" && (
          <div>
            <br />
            <br />
            <br />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <br />
            <br />
            <input
              type="text"
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <br />
            <br />
            <button
              className="btn btn-primary"
              onClick={handleSubmitCashOnDelivery}
            >
              Submit
            </button>
            <br />

            {displaycashondeliverystatus ? (
              cashondeliverystatus === "pending" ? (
                <button className="btn btn-success" disabled>
                  Waiting for response
                </button>
              ) : cashondeliverystatus === "Confirm Order" ? (
                <>
                  <br />
                  <p>Order Confirmed</p>
                  <img
                    src={cashapproved}
                    alt="Order Confirmed"
                    className="paymentpic"
                  />
                </>
              ) : (
                <img
                  src={cashrejected}
                  alt="Order Rejected"
                  className="paymentpic"
                />
              )
            ) : (
              <p >
                 Enter Correct Address
                </p>
            )}
          </div>
        )}

        {paymentMethod === "upi" && (
          <>
            <QRCode value={upiPaymentLink} />
            <br />
            <br />
            <p>Please click button after complete payment</p>
            {!paymentCompleted ? (
              <button
                className="btn btn-success"
                onClick={handlePaymentCompletion}
              >
                Payment Initiated
              </button>
            ) : (
              <>
                {paymentstatus === "Payment Received" ? (
                  <img
                    src={paymentsuccessful}
                    alt="Payment Successful"
                    className="paymentpic"
                  />
                ) : paymentstatus === "Payment Not Received" ? (
                  <>
                    <img
                      src={paymentunsuccessful}
                      alt="Payment Unsuccessful"
                      className="paymentpic"
                    />
                    <br />
                    <button
                      className="btn btn-success"
                      onClick={handleRetryPayment}
                    >
                      Retry Payment
                    </button>
                  </>
                ) : paymentstatus === "pending" ? (
                  <button className="btn btn-success" disabled>
                    Waiting for response
                  </button>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
