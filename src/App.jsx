import {BrowserRouter, Routes, Route} from 'react-router';

import './App.css';

import Home from './views/Home';
import Menu from './views/Menu';
import Lunch from './views/Lunch';
import Reservation from './views/Reservation';
import Contact from './views/Contact';
import Login from './views/Login';
import Admin from './views/Admin';
import MyOrders from './views/MyOrders';
import MyReservations from './views/MyReservations';
import Account from './views/Account';

import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="menu" element={<Menu />} />

          <Route path="lunch" element={<Lunch />} />

          <Route path="contact" element={<Contact />} />

          <Route path="reservation" element={<Reservation />} />

          <Route path="login" element={<Login />} />

          <Route path="admin" element={<Admin />} />

          <Route path="my-orders" element={<MyOrders />} />

          <Route path="my-reservations" element={<MyReservations />} />

          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
