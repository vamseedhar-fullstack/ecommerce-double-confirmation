import React from 'react';
import  Product  from './Pages/Product';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import  {Admin}  from './Pages/Admin';
import './App.css'
import { Loginpage } from './Pages/loginpage';
import Cart from './Pages/cart';
import  Checkout  from './Pages/checkout';
import { Adminprodectdetails } from './Pages/adminprodectdetails';
import  Adminorderslist  from './Pages/adminorderslist';
import Signup from './Pages/Login';


const App = () => {

    return (
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Loginpage/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path='/user' element={<Product/>}/>
            <Route path='/cart' element={<Cart/>}/>
            <Route path='/checkout' element={<Checkout/>}/>
            <Route path='/admin' element={<Admin/>}/>
            <Route path='/adminprodectdetails' element={<Adminprodectdetails/>}/>
            <Route path='/adminorderslist' element={<Adminorderslist/>}/>

        </Routes>
      </BrowserRouter>
    );
}
export default App;