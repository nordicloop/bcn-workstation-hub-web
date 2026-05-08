import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PropertiesListScreen } from './properties/PropertiesListScreen'
import { PropertyDetailScreen } from './properties/PropertyDetailScreen'
import { Header } from './components/Header'

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<PropertiesListScreen />} />
                <Route
                    path="/properties/:id"
                    element={<PropertyDetailScreen />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App
