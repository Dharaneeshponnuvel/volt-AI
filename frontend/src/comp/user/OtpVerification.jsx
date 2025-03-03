import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "../css/otpVerification.css";

function OtpVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(120);
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state;

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const verifyOtp = async () => {
        setError('');
        const enteredOtp = otp.join('');

        if (enteredOtp.length < 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email: formData.email,
                otp: enteredOtp,
                ...formData
            });

            if (response.data.message === "Registration successful") {
                alert('Registration successful!');
                navigate('/login');
            } else {
                setError('Invalid OTP. Try again.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'OTP verification failed');
        }
    };

    return (
        <div className="otp-container">
            {!formData ? (
                <div className="error-message">Error: No registration data found. Please restart the registration process.</div>
            ) : (
                <>
                    <h2>Verify OTP</h2>
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                            />
                        ))}
                    </div>
                    <p className="timer">
                        Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                    <button type="button" onClick={verifyOtp}>Verify OTP</button>
                    {error && <div className="error-message">{error}</div>}
                </>
            )}
        </div>
    );
}

export default OtpVerification;
