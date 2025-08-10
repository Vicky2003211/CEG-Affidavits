import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "@fortawesome/fontawesome-free/css/all.min.css";
import favicon from "./Assets/image.png";

// ✅ Set global browser tab title
document.title = "CEG-Affidavits";

// ✅ Set global favicon (logo)
const link = document.querySelector("link[rel~='icon']");
if (link) {
  link.href = favicon; // Path from public folder
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
