import { useState } from "react";
import "./LoginPage.css"; // Import the CSS file
import evCarImage from "../src/background.jpg"; // Ensure the image is inside src folder

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both username and password");
      return;
    }
    alert(`Logged in as: ${username}`);
  };

  return (
    <div className="login-container">
      {/* Left side with EV car image */}
      <div className="image-section">
        <img src={evCarImage} alt="EV Car" />
      </div>

      {/* Right side with login form */}
      <div className="login-box">
        <h2>Welcome to EV Portal</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
