import React, { useState, useEffect } from "react";
import { Star, MoreVertical, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../../api/client.api";
import type { Client, PaginatedResponse, PaginationParams, Role } from "../../../utils/types";
import { projectsAPI } from "../../../api/projects.api"
import { useParams } from "react-router-dom";

interface TimeEntry {
  id: number;
  name: string;
  assignees: string;
  tracked: string;
  amount: string;
  date: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ProjectDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState("status");
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  // Project data
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [projectColor, setProjectColor] = useState("#84cc16");
  const [isBillable, setIsBillable] = useState(true);
  const [isNonBillable, setIsNonBillable] = useState(false);
  const [startDate, setStartDate] = useState("2025-10-01");
  const [rate, setRate] = useState("0.00");
  const [visibility, setVisibility] = useState("public");

  // API state
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [projectDatas, setprojectDatas] = useState<any | null>([])


  // Stats
  const [totalTracked, settotalTracked] = useState("");
  const [billableTime] = useState("3.01h");
  const [nonBillableTime] = useState("0.00h");
  const [totalAmount] = useState("0.00 USD");

  // Time entries

  useEffect(() => {
    const fetchTimesheetProject = async () => {
      // setLoading(true);
      try {
        const params: Partial<PaginationParams> = {};
        const response = await projectsAPI.getProjectById(id);
        if (response && Array.isArray(response.timesheets)) {
          const total = response.timesheets.reduce(
            (sum, element) => sum + (Number(element.duration) || 0),
            0
          );
          settotalTracked(total)
        }

        setprojectDatas(response)
        setProjectName(response.project_name)

        // setRoles(Array.isArray(response) ? response : []);
      } catch (err) {
        // setError("Failed to fetch roles. Please try again.");
        console.error(err);
      } finally {
        // setLoading(false);
      }
    };

    fetchTimesheetProject();
  }, []);



  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      setClientsError(null);

      const response = await usersAPI.getClients();
      let clientList: Client[] = [];

      if (Array.isArray(response)) {
        clientList = response;
        response.forEach(client => {
          console.log(client.name, "kjhgfghjkl;lkjhg");
        });
      } else if (Array.isArray(response.data)) {
        clientList = response.data;
        response.data.forEach(client => {
          console.log(client.name, "kjhgfghjkl;lkjhg");
        });
      } else {
        console.log("Unexpected response format:", response);
      }

      setClients(clientList);

    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientsError("Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  };


  const handleAddMember = () => {
    if (newMemberEmail) {
      const newMember: TeamMember = {
        id: Date.now(),
        name: newMemberEmail.split("@")[0],
        email: newMemberEmail,
        role: newMemberRole,
      };
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberEmail("");
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (id: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };
  const today = new Date().toISOString().split("T")[0];


  const handleSaveSettings = async () => {
    try {
      // Here you would typically call an API to save project settings
      // Example: await projectAPI.updateProject(projectId, { projectName, client, ... });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      padding: "2rem",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <div onClick={() => navigate(`/projects/`)} style={{
          fontSize: "0.875rem",
          color: "#22d3ee",
          marginBottom: "0.5rem",
          cursor: "pointer",
        }}>
          ⇦&nbsp;<u>Projects</u>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "400",
            color: "#6b7280",
            margin: 0,
          }}>
            {projectName}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              style={{
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "0.5rem",
                cursor: "pointer",
              }}
            >
              <Star
                size={20}
                style={{
                  color: isFavorite ? "#fbbf24" : "#d1d5db",
                  fill: isFavorite ? "#fbbf24" : "none",
                }}
              />
            </button>
            <button style={{
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              padding: "0.5rem",
              cursor: "pointer",
            }}>
              <MoreVertical size={20} style={{ color: "#6b7280" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "2rem",
        borderBottom: "1px solid #e5e7eb",
      }}>
        {["status", "settings", "access"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === tab ? "#e5e7eb" : "transparent",
              border: "none",
              borderRadius: "4px 4px 0 0",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: activeTab === tab ? "#374151" : "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "status" && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.5rem",
                }}>
                  TRACKED
                </div>
                <div style={{
                  fontSize: "1.5rem",
                  fontWeight: "400",
                  color: "#374151",
                }}>
                  {totalTracked}
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}>
                <div>
                  <div style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}>
                    BILLABLE
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "400",
                    color: "#374151",
                  }}>
                    {billableTime}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}>
                    NON-BILLABLE
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "400",
                    color: "#374151",
                  }}>
                    {nonBillableTime}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}>
                <div style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}>
                  AMOUNT
                </div>
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "400",
                  color: "#374151",
                }}>
                  {totalAmount}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="280" height="280" viewBox="0 0 280 280">
                <circle
                  cx="140"
                  cy="140"
                  r="100"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="60"
                  strokeDasharray="628.3"
                  strokeDashoffset="0"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="100"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="60"
                  strokeDasharray="628.3"
                  strokeDashoffset="-628.3"
                />
                <text
                  x="140"
                  y="150"
                  textAnchor="middle"
                  fontSize="24"
                  fill="#374151"
                  fontWeight="400"
                >
                  {totalTracked}
                </text>
              </svg>
              <div style={{
                display: "flex",
                gap: "1.5rem",
                marginTop: "1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#84cc16",
                    borderRadius: "2px",
                  }}></div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Billable</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#d1d5db",
                    borderRadius: "2px",
                  }}></div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Non-billable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}>
          <h3 style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "1.5rem",
          }}>
            Project Settings
          </h3>

          <div style={{ maxWidth: "600px" }}>
            {/* Project Name */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            {/* Client */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Client
              </label>
              {loadingClients ? (
                <div style={{
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}>
                  Loading clients...
                </div>
              ) : clientsError ? (
                <div style={{
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#ef4444",
                }}>
                  {clientsError}
                </div>
              ) : (
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Color */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Color
              </label>
              <input
                type="color"
                value={projectColor}
                onChange={(e) => setProjectColor(e.target.value)}
                style={{
                  width: "60px",
                  height: "40px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Billable */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "#22d3ee",
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Billable
                </span>
              </label>
            </div>

            {/* Non-Billable */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={isNonBillable}
                  onChange={(e) => setIsNonBillable(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "#22d3ee",
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Non-Billable
                </span>
              </label>
            </div>

            {/* Start Date */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate || today}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />

            </div>

            {/* Rate */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Hourly Rate (USD)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="0.01"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#22d3ee",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      )}

      {/* Access Tab */}
      {activeTab === "access" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}>
          <h3 style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "1.5rem",
          }}>
            Project Access
          </h3>

          {/* Visibility */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "1rem",
            }}>
              Visibility
            </label>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Public</span>
              </label>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Private</span>
              </label>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}>
              <h4 style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                margin: 0,
              }}>
                Team Members
              </h4>
              <button
                onClick={() => setShowAddMember(true)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#22d3ee",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Plus size={16} /> Add Member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div style={{
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleAddMember}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#22d3ee",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Members Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}>
                    NAME
                  </th>
                  <th style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}>
                    EMAIL
                  </th>
                  <th style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}>
                    ROLE
                  </th>
                  <th style={{ padding: "0.75rem", width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{
                      padding: "1rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                    }}>
                      {member.name}
                    </td>
                    <td style={{
                      padding: "1rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}>
                      {member.email}
                    </td>
                    <td style={{
                      padding: "1rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}>
                      {member.role}
                    </td>
                    <td style={{ padding: "1rem 0.75rem" }}>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                        }}
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

// function setLoading(arg0: boolean) {
//   throw new Error("Function not implemented.");
// }
// function setRoles(arg0: never[] | (PaginatedResponse<Role> & any[])) {
//   throw new Error("Function not implemented.");
// }

