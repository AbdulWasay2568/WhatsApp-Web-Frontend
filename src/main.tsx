// main.tsx (or App.tsx at a high level)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/Auth";
import { SocketContextProvider } from "./context/socketContext";
import "./index.css";
import { CallProvider } from "./context/callContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketContextProvider>
        <CallProvider>
          <App />
        </CallProvider>
      </SocketContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
