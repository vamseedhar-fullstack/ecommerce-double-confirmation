import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {  useNavigate } from "react-router-dom";


const columns = [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Order ID',
      accessor: 'orderid',
    },
   
    {
      Header: 'Customer Username',
      accessor: 'customer_username',
    },
    {
      Header: 'Total Price',
      accessor: 'totalPrice',
    },
    {
      Header: 'Payment Method',
      accessor: 'paymentMethod',
    },
    {
      Header: 'Cash on Delivery Status',
      accessor: 'cashondeliverystatus',
    },
    {
      Header: 'Payment Status',
      accessor: 'paymentStatus',
    },
    {
      Header: 'Created At',
      accessor: 'createdAt',
    },
    {
      Header: 'Updated At',
      accessor: 'updatedAt',
    },
    {
      Header: 'All Products',
      accessor: 'allproducts',
    },
    {
      Header: 'Address',
      accessor: 'address',
    },
    {
      Header: 'Pincode',
      accessor: 'pincode',
    },
  ];

const Adminorderslist = () => {
  const [data, setData] = useState([]); // State to hold your data
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

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
    fetchCartItems(); // Fetch data when the component mounts
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/getallorders", {
        params: { adminusername: "admin" },
      });
      const allorders = response.data;
      setData(allorders); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // Use react-table hooks to define table properties
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <div>
      <h1>Orders List</h1>
      <table {...getTableProps()} style={{ border: 'solid 1px blue', borderCollapse: 'collapse' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} style={{ borderBottom: 'solid 1px red', background: 'aliceblue', padding: '8px' }}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} style={{ border: 'solid 1px gray', padding: '8px' }}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Adminorderslist;
