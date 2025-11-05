import MemberCrewDirectory from "./components/MemberCrewDirectory";
import NonMemberCrewDirectory from "./components/NonMemberCrewDirectory";
import LocationDirectory from "./components/LocationDirectory";
import JobBoard from "./components/JobBoard";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return ( 
        <BrowserRouter>
            <Routes>
                <Route path="/MemberCrewDirectory" element={<MemberCrewDirectory />} />
                <Route path="/NonMemberCrewDirectory" element={<NonMemberCrewDirectory />} />
                <Route path="/LocationDirectory" element={<LocationDirectory />} />
                <Route path="/JobBoard" element={<JobBoard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
