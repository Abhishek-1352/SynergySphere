import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function Signup() {
const [form, setForm] = useState({ name: "", email: "", password: "" });
const navigate = useNavigate();


const handleSignup = async () => {
try {
await axios.post("http://localhost:5000/api/auth/signup", form);
navigate("/");
} catch (err) {
alert("Signup failed");
}
};


return (
<div>
<h2>Signup</h2>
<input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
<input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
<input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
<button onClick={handleSignup}>Signup</button>
<p>Already have an account? <Link to="/">Login</Link></p>
</div>
);
}


export default Signup;