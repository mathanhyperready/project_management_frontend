import { MoreVertical, Trash2, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { usersAPI } from "../../../api/client.api";
import type { Client } from "../../../utils/types";

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setname] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.getClients();
      console.log("API Response:", response); // Debug log
      
      // Handle different response formats
      let clientData: Client[] = [];
      if (Array.isArray(response)) {
        clientData = response;
      } else if (response && typeof response === 'object') {
        // Try common pagination property names
        clientData = (response as any).data || (response as any).results || [];
      }
      
      console.log("Parsed clients:", clientData);
      setClients(clientData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch clients");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new client
  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Client name is required!");
      return;
    }

    try {
      const newClientData = {
        name: name,
        address: address,
        contact: contact,
        email: email,
        notes: notes,
        is_enabled: isActive,
      };

      const createdClient = await usersAPI.createClient(newClientData);
      setClients([...clients, createdClient]);
      
      // Reset form
      setname("");
      setAddress("");
      setContact("");
      setEmail("");
      setNotes("");
      setIsActive(true);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to create client");
      console.error("Error creating client:", err);
    }
  };

  // Update status to Active
  const handleSetActive = async (id: number) => {
    try {
      await usersAPI.updateClient(id, { is_enabled: true });
      setClients((prev) =>
        prev.map((client) =>
          client.id === id ? { ...client, is_enabled: true } : client
        )
      );
      setShowMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to update client");
      console.error("Error updating client:", err);
    }
  };

  // Update status to Inactive
  const handleSetInactive = async (id: number) => {
    try {
      await usersAPI.updateClient(id, { is_enabled: false });
      setClients((prev) =>
        prev.map((client) =>
          client.id === id ? { ...client, is_enabled: false } : client
        )
      );
      setShowMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to update client");
      console.error("Error updating client:", err);
    }
  };

  // Delete client
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );
    if (confirmDelete) {
      try {
        await usersAPI.deleteClient(id);
        setClients((prev) => prev.filter((r) => r.id !== id));
        setShowMenu(null);
      } catch (err: any) {
        alert(err.message || "Failed to delete client");
        console.error("Error deleting client:", err);
      }
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

  if (loading) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={fetchClients}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#22d3ee",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

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
          Clients
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
          ✚ Create Client
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
              <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", width: "40px" }}>
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
                <b>Client Name</b>
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
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <input type="checkbox" style={{ cursor: "pointer" }} />
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#374151" }}>
                  {client.name}
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#374151" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: client.is_enabled ? "#d1fae5" : "#fee2e2",
                      color: client.is_enabled ? "#065f46" : "#991b1b",
                    }}
                  >
                    {client.is_enabled ? "Active" : "Inactive"}
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
                      setShowMenu(showMenu === client.id ? null : client.id);
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
                  {showMenu === client.id && (
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
                        onClick={() => handleSetActive(client.id)}
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
                        onClick={() => handleSetInactive(client.id)}
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
                        onClick={() => handleDelete(client.id)}
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

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "1rem", color: "#9ca3af" }}
                >
                  No clients found
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
              width: "32rem",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
              position: "relative",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setname("");
                setAddress("");
                setContact("");
                setEmail("");
                setNotes("");
                setIsActive(true);
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
              Create Client
            </h2>

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
                Client Name
              </label>
              <input
                type="text"
                placeholder="Enter client name"
                value={name}
                onChange={(e) => setname(e.target.value)}
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
                Address
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                Contact
              </label>
              <input
                type="text"
                placeholder="Enter contact number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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
                placeholder="Enter email"
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
                Notes
              </label>
              <textarea
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ marginRight: "0.5rem", cursor: "pointer" }}
                />
                Active
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setname("");
                  setAddress("");
                  setContact("");
                  setEmail("");
                  setNotes("");
                  setIsActive(true);
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

export default ClientList;