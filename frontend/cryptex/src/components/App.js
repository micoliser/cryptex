import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "../pages/Home";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import Profile from "../pages/Profile";
import Layout from "../pages/Layout";
import { AuthProvider } from "../contexts/AuthContext";
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
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
