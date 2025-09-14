import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from "./pages/LoginPage.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const AppRoutes = ({ account }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <LoginPage onLogin={(accountAddress, role) => {
                // This function will be passed down from the parent App component
                window.handleLogin(accountAddress, role);
              }} />
            </motion.div>
          } 
        />
        <Route 
          path="/farmer-dashboard" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FarmerDashboard account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/buyer-dashboard" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BuyerDashboard account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ProfilePage account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
