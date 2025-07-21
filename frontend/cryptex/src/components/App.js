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
import TradeCompleted from "../pages/TradeCompleted";
import Layout from "../pages/Layout";
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
          </Route>
          <Route
            path="/trade/:id/completed"
            element={
              <ProtectedRoute>
                <TradeCompleted />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
