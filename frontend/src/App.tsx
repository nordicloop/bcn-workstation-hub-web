import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PropertiesListScreen } from './properties/PropertiesListScreen'
import { PropertyDetailScreen } from './properties/PropertyDetailScreen'
import { BookingPage } from './pages/BookingPage'
import { HostDashboard } from './pages/HostDashboard'
import { Header } from './components/Header'

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<BookingPage />} />
                <Route path="/properties" element={<PropertiesListScreen />} />
                <Route
                    path="/properties/:id"
                    element={<PropertyDetailScreen />}
                />
                <Route path="/host-dashboard" element={<HostDashboard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
