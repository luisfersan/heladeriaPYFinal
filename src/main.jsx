import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' //Sistema de autenticación
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {' '}
        {/* Envuelve la app con autenticación */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
