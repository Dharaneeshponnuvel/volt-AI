import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="dashboard">
            <h2>Welcome to the Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
