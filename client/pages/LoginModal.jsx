import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 🔥 added

function LoginModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // 🔥 added

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = isLogin
                ? "http://localhost:5000/api/auth/login"
                : "http://localhost:5000/api/auth/signup";

            const res = await axios.post(url, formData);

            localStorage.setItem("token", res.data.token);
            onClose();
            navigate("/dashboard");

        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Something went wrong";

            if (msg.toLowerCase().includes("user not found")) {
                setIsLogin(false);
                setError("No account found. Please signup.");
            }
            else if (msg.toLowerCase().includes("invalid")) {
                setError("Wrong password. Try again.");
            }
            else {
                setError(msg);
            }
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer">

            <div className="bg-white/20 backdrop-blur-xl border border-white/30
                            shadow-xl rounded-2xl p-6 w-[350px] relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white text-lg"
                >
                    ✕
                </button>

                <h2 className="text-white text-xl font-semibold mb-4 text-center">
                    {isLogin ? "Login" : "Signup"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {!isLogin && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            onChange={handleChange}
                            className="px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white outline-none"
                            required
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white outline-none"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white outline-none"
                        required
                    />

                    {error && (
                        <p className="text-red-300 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="py-2 bg-[#2a465b] text-white rounded-lg"
                    >
                        {loading
                            ? "Processing..."
                            : isLogin
                                ? "Login"
                                : "Signup"}
                    </button>
                </form>

                <p className="text-white text-sm text-center mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="ml-2 underline cursor-pointer"
                    >
                        {isLogin ? "Signup" : "Login"}
                    </span>
                </p>

            </div>
        </div>
    );
}

export default LoginModal;