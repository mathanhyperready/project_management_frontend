import React, { useState } from "react";

const Authpage: React.FC = () => {
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${activeForm} Data:`, formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div
        className="bg-white rounded-2xl shadow-lg flex flex-col justify-center items-center transition-all duration-300"
        style={{ width: "6in", height: "8in", padding: "1rem" }}
      >
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setActiveForm("signup")}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${
              activeForm === "signup"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            
          >
            Sign Up
          </button>
          <button
            onClick={() => setActiveForm("login")}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${
              activeForm === "login"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            
          >
            Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full px-4 flex flex-col space-y-4" >
          {activeForm === "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ marginTop: "0.3in" }}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ marginTop: "0.3in" }}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 transition"
            style={{ marginTop: "0.5in" }}
          >
            {activeForm === "signup" ? "Create Account" : "Login"}
          </button>
        </form>

        <p
          className="text-center text-xs text-gray-500 mt-6"
          style={{ marginTop: "0.5in" }}
        >
          {activeForm === "signup"
            ? "Already have an account?"
            : "Don’t have an account?"}{" "}
          <span
            onClick={() =>
              setActiveForm(activeForm === "signup" ? "login" : "signup")
            }
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {activeForm === "signup" ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Authpage;