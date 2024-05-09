import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedPage from "./components/ProtectedPage";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProjectInfo from "./pages/ProjectInfo";
import Register from "./pages/Register";
import PageNotFound from "./pages/404";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const { loading } = useSelector((state) => state.loaders);
  return (
    <div>
      {loading && <Spinner />}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedPage>
                <Home />
              </ProtectedPage>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedPage>
                <ProjectInfo />
              </ProtectedPage>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedPage>
                <Profile />
              </ProtectedPage>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/verifyemail/:token"
            element={
              <PublicRoutes>
                <VerifyEmail />
              </PublicRoutes>
            }
          />
          <Route
            path="/resetpassword/:token"
            element={
              <PublicRoutes>
                <ResetPassword />
              </PublicRoutes>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export function PublicRoutes({ children }) {
  const user = localStorage.getItem("user");
  if (user !== "" && user) {
    return <Navigate to="/" />;
  } else {
    return children;
  }
}

export default App;
