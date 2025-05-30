import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuth = localStorage.getItem("token") !== null;
  return isAuth ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
