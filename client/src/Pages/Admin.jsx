import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Card, CardContent, Typography, makeStyles } from "@material-ui/core";
import { jwtDecode } from "jwt-decode";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
    maxWidth: 300,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export const Admin = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
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

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/adminpaymentconfirm"
      );
      let paymentData = response.data || [];

      if (!Array.isArray(paymentData)) {
        paymentData = [paymentData];
      }
      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Payment Confirmations
      </Typography>
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
      <div>
        {payments.length === 0 ? (
          <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <b>No Orders Available</b>
          </div>
        ) : (
          <div
            className="d-flex flex-row justify-content-center align-items-start"
            style={{ height: "100vh" }}
          >
            {payments.map((payment) => (
              <Link
                to={{
                  pathname: `/adminprodectdetails`,
                  search: `?username=${payment.customer_username}&totalPrice=${payment.totalPrice}&orderid=${payment.orderid}`,
                }}
                key={payment.id}
                style={{ textDecoration: "none" }}
              >
                <Card className={classes.card}>
                  <CardContent className={classes.content}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Order Id: {payment.orderid}
                    </Typography>
                    <Typography variant="body1" component="h2" gutterBottom>
                      Order Placed Time:{" "}
                      {new Date(payment.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </Typography>
                    <Typography variant="body1" component="h2" gutterBottom>
                      Username: {payment.customer_username}
                    </Typography>
                    <Typography variant="body1">
                      Payment Method:{payment.paymentMethod}
                    </Typography>
                    <Typography variant="body1">
                      Total Price: Rs.{payment.totalPrice}
                    </Typography>
                    <Typography
                      variant="h6"
                      style={{
                        color:
                          (payment.paymentMethod === "cash" &&
                            payment.cashondeliverystatus === "pending") ||
                          (payment.paymentMethod === "upi" &&
                            payment.paymentStatus === "pending")
                            ? "orange"
                            : payment.cashondeliverystatus ===
                                "Confirm Order" ||
                              payment.paymentStatus === "Payment Received"
                            ? "green"
                            : payment.cashondeliverystatus === "Reject Order" ||
                              payment.paymentStatus === "Payment Not Received"
                            ? "red"
                            : "inherit",
                      }}
                    >
                      Order Status:{" "}
                      {payment.paymentMethod === "cash"
                        ? payment.cashondeliverystatus
                        : payment.paymentStatus}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
