import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { Logout, AuthPage, useAuth } from "../modules/auth";
import { App } from "../App";

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  // 1. Get both auth (from localStorage) and currentUser (from API)
  const { auth, currentUser } = useAuth();

  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="logout" element={<Logout />} />

          {/* 2. THE FIX: 
             If 'auth' exists in localStorage, it means the user was logged in.
             We trust the 'auth' token/ID during the reload to keep the user 
             in the Private section while AuthInit fetches the full profile.
          */}
          {auth ? (
            <>
              <Route path="/*" element={<PrivateRoutes />} />
              <Route index element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <>
              <Route path="auth/*" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
