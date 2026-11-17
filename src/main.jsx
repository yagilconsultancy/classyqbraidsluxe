import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY -- admin login will not work');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
