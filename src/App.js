import CrewDirectory from "./components/CrewDirectory";
import LocationDirectory from "./components/LocationDirectory";
import JobBoard from "./components/JobBoard";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
    return ( 
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/CrewDirectory" replace />} />
                <Route path="/CrewDirectory" element={<CrewDirectory />} />
                <Route path="/LocationDirectory" element={<LocationDirectory />} />
                <Route path="/JobBoard" element={<JobBoard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
