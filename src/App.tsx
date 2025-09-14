
import './App.css'
import { AppRouter } from './components'
import { AuthProvider } from './contexts'

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}

export default App

