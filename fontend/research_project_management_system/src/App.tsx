import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center gap-4 mb-6">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="h-16 hover:scale-110 transition-transform duration-300" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="h-16 hover:scale-110 transition-transform duration-300" alt="React logo" />
          </a>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Vite + React + Tailwind</h1>
        <div className="mb-6">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Count is {count}
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Edit <code className="bg-gray-100 px-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
        <p className="text-sm text-gray-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App