import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";


function App() {
return (
<Router>
<Routes>
<Route path="/" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/project/:id" element={<ProjectDetail />} />
</Routes>
</Router>
);
}


export default App;