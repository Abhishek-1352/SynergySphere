import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function Login() {
const [form, setForm] = useState({ email: "", password: "" });
const navigate = useNavigate();


const handleLogin = async () => {
try {
const res = await axios.post("http://localhost:5000/api/auth/login", form);
localStorage.setItem("token", res.data.token);
navigate("/dashboard");
} catch (err) {
alert("Login failed");
}
};


return (
<div>
<h2>Login</h2>
<input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
<input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
<button onClick={handleLogin}>Login</button>
<p>Don’t have an account? <Link to="/signup">Signup</Link></p>
</div>
);
}


export default Login;