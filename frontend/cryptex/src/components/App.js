import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "../pages/Home";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import Profile from "../pages/Profile";
import SelectTrader from "../pages/SelectTrader";
import TradePage from "../pages/Trade";
import PendingTrade from "../pages/PendingTrade";
import Transactions from "../pages/Transactions";
import TransactionDetail from "../pages/TransactionDetail";
import TradeCompleted from "../pages/TradeCompleted";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Layout from "../pages/Layout";
import NotFound from "../pages/NotFound";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import "../styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="select-trader"
              element={
                <ProtectedRoute>
                  <SelectTrader />
                </ProtectedRoute>
              }
            />
            <Route
              path="trade/:id"
              element={
                <ProtectedRoute>
                  <TradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trades/pending"
              element={
                <ProtectedRoute>
                  <PendingTrade />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedRoute>
                  <Transactions tradeId={"jjdhfnsjh"} />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade/:id/completed"
              element={
                <ProtectedRoute>
                  <TradeCompleted />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
