import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import "../css/register.css";

const GOOGLE_CLIENT_ID = "27977667931-kjs0tl20p9q4749m90m0r992q7es5qkl.apps.googleusercontent.com";

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        gender: '',
    });

    const navigate = useNavigate();

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Function to send OTP for email verification
    const sendOtp = async () => {
        if (!formData.email) {
            alert("Please enter your email for OTP verification.");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/send-otp', { email: formData.email });
            navigate('/OtpVerification', { state: formData }); // Send full user data for verification
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send OTP');
        }
    };

    return (
        <div className="form-wrapper">
            <h2>Register</h2>
            <form>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
                <input type="text" name="address" placeholder="Address" onChange={handleChange} required />

                <select name="gender" onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>

                <button type="button" onClick={sendOtp}>Send OTP</button>

                <div className="google-auth">
                    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <GoogleLogin
                            onSuccess={(response) => {
                                console.log("Google Sign-In Success", response);
                                navigate('/home'); // Redirect after successful login
                            }}
                            onError={() => alert("Google Registration Failed")}
                        />
                    </GoogleOAuthProvider>
                </div>
            </form>
        </div>
    );
}

export default Register;
