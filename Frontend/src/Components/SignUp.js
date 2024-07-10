import React, { useState } from 'react';
import '../CSS/Signin.css'
import { Link, useNavigate, } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const Navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {

            username:username,
            email: email,
            password: password,
        };
        axios.post("http://127.0.0.1:8000/api/chatapp/register/", userData)
           .then((response) => {
                console.log("response of register is", response);
                Navigate("/");
            })
           .catch((error) => {
                setError("Failed to register. Please try again.");
            });
    }

    return (
        <div>
            <div className="container">
                <div className="registration form">
                    <header>Signup</header>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="text" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input type="submit" className="button" value="Signup" />
                        {error && <div style={{ color: 'ed' }}>{error}</div>}
                    </form>
                    <div className="signup">
                        <span className="signup">Already have an account?
                            <Link to="/">Login</Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp;