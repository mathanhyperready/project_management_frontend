import { MoreVertical, Trash2, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface User {
  id: number;
  user_name: string;
  password: string;
  email: string;
  rolename: string;
  status: "Active" | "Inactive";
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      user_name: "john_doe",
      password: "********",
      email: "john@example.com",
      rolename: "Administrator",
      status: "Active",
    },
    {
      id: 2,
      user_name: "jane_smith",
      password: "********",
      email: "jane@example.com",
      rolename: "Manager",
      status: "Active",
    },
    {
      id: 3,
      user_name: "bob_wilson",
      password: "********",
      email: "bob@example.com",
      rolename: "Employee",
      status: "Inactive",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("Employee");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Create new user
  const handleCreate = () => {
    if (!userName.trim() || !email.trim() || !password.trim()) {
      alert("All fields are required!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const newUser: User = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      user_name: userName,
      password: "********", // Password is masked
      email: email,
      rolename: roleName,
      status: "Active", // Default status is Active
    };

    setUsers([...users, newUser]);
    setUserName("");
    setPassword("");
    setEmail("");
    setRoleName("Employee");
    setStatus("Active");
    setShowModal(false);
  };

  // Update status to Active
  const handleSetActive = (id: number) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: "Active" } : user))
    );
    setShowMenu(null);
  };

  // Update status to Inactive
  const handleSetInactive = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: "Inactive" } : user
      )
    );
    setShowMenu(null);
  };

  // Delete user
  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setShowMenu(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ padding: "1.5rem" }} ref={menuRef}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "400",
            color: "#374151",
            margin: 0,
          }}
        >
          Users
        </h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "0.625rem 1.5rem",
            backgroundColor: "#22d3ee",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ✚ Create User
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          overflow: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          backgroundColor: "white",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th
                style={{ padding: "0.75rem 1.5rem", textAlign: "left", width: "40px" }}
              >
                <input type="checkbox" style={{ cursor: "pointer" }} />
              </th>
              <th
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <b>User Name</b>
              </th>
              <th
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <b>Email</b>
              </th>
              <th
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <b>Role</b>
              </th>
              <th
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <b>Status</b>
              </th>
              <th
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              ></th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#F9FAFB", fontSize: "0.875rem" }}>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <input type="checkbox" style={{ cursor: "pointer" }} />
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#374151" }}>
                  {user.user_name}
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#6b7280" }}>
                  {user.email}
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#374151" }}>
                  {user.rolename}
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#374151" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor:
                        user.status === "Active" ? "#d1fae5" : "#fee2e2",
                      color: user.status === "Active" ? "#065f46" : "#991b1b",
                    }}
                  >
                    {user.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    position: "relative",
                    width: "10px",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === user.id ? null : user.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                    }}
                  >
                    <MoreVertical size={18} color="#6b7280" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu === user.id && (
                    <div
                      style={{
                        position: "fixed",
                        transform: "translate(-90%, 0)",
                        marginTop: "0.25rem",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                        zIndex: 9999,
                        minWidth: "180px",
                        padding: "0.5rem 0",
                      }}
                    >
                      <button
                        onClick={() => handleSetActive(user.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.25rem",
                          width: "100%",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#374151",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f3f4f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        ✓ Active
                      </button>
                      <button
                        onClick={() => handleSetInactive(user.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.25rem",
                          width: "100%",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#374151",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f3f4f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        ✗ Inactive
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.25rem",
                          width: "100%",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#dc2626",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fef2f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    color: "#9ca3af",
                  }}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              width: "28rem",
              padding: "1.5rem",
              position: "relative",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setUserName("");
                setPassword("");
                setEmail("");
                setRoleName("Employee");
                setStatus("Active");
              }}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={20} color="#6b7280" />
            </button>

            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              Create User
            </h2>

            {/* User Name */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Role
              </label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  backgroundColor: "white",
                }}
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            {/* Status */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Status
              </label>
              <input
                type="text"
                value="Active"
                readOnly
                disabled
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  backgroundColor: "#f9fafb",
                  color: "#6b7280",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setUserName("");
                  setPassword("");
                  setEmail("");
                  setRoleName("Employee");
                  setStatus("Active");
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#22d3ee",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;