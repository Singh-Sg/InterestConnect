import React, { useState } from 'react';
import '../CSS/Signin.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);

    const Navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const userData = {
            username: username,
            password: password,
        };

        axios.post("http://127.0.0.1:8000/api/chatapp/login/", userData)
            .then((response) => {
                localStorage.setItem("username", username);
                localStorage.setItem("password", password);
                Navigate("/datashow");
            })
            .catch((error) => {
                setError("Failed to login. Please try again.");
            });
    }

    return (
        <div className="container" >
            <div className="registration form">
                <header>Sign In</header>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  
                    <input type="submit" className="button" value="Sign In" />
                    
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                </form>
                <div className="signup">
                    <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
                </div>
            </div>
        </div>
    )
}

export default SignIn;