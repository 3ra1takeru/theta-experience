import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Schedule } from './pages/Schedule';
import { Testimonials } from './pages/Testimonials';
import { Admin } from './pages/Admin';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// PayPal Client ID
const PAYPAL_CLIENT_ID = "Ab4ZtIdavN0_ZQqqnygXwbEFYCtpp9gLL9cDFH8kbgVVFFMWlZ3INAbvOoOiluYbY3RthfcRHPCH-jvc";

function App() {
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "JPY" }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;
