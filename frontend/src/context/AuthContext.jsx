import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authApi } from "../api/services/auth.js";
import { TOKEN_KEY } from "../api/client.js";
import { useToast } from "./ToastContext.jsx";
import LoginModal from "../components/auth/LoginModal.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const pendingAction = useRef(null);

  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Load the current user whenever we hold a token.
  useEffect(() => {
    if (!token) return;
    authApi.me().then(setUser).catch(() => {});
  }, [token]);

  // React to 401s surfaced by the axios interceptor (expired/invalid token).
  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem(TOKEN_KEY)) {
        logout();
        toast.error("Session expired — please sign in again");
        setLoginOpen(true);
      }
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [logout, toast]);

  const openLogin = useCallback((pending) => {
    pendingAction.current = typeof pending === "function" ? pending : null;
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    pendingAction.current = null;
    setLoginOpen(false);
  }, []);

  // Run `fn` if signed in; otherwise prompt login and run it afterwards.
  const requireAuth = useCallback(
    (fn) => {
      if (token) fn();
      else openLogin(fn);
    },
    [token, openLogin]
  );

  const login = useCallback(async (email, password) => {
    const { access_token } = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    setLoginOpen(false);
    const pending = pendingAction.current;
    pendingAction.current = null;
    if (pending) pending();
  }, []);

  const register = useCallback(
    async (email, password) => {
      await authApi.register({ email, password });
      await login(email, password);
    },
    [login]
  );

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    openLogin,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginOpen && <LoginModal onClose={closeLogin} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
