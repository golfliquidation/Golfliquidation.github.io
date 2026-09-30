import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/global.css";

(function restoreSpaPath() {
  const redirect = sessionStorage.getItem("spa-redirect");
  if (redirect) {
    sessionStorage.removeItem("spa-redirect");
    window.history.replaceState(null, "", redirect);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
