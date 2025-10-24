import React, { useState, useEffect } from "react";
import { Star, MoreVertical, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clientsAPI } from "../../../api/client.api";
import type { Client, PaginatedResponse, PaginationParams, Role } from "../../../utils/types";
import { projectsAPI } from "../../../api/projects.api"
import { useParams } from "react-router-dom";
import { usersAPI } from "../../../api/users.api";

// import { usersAPI } from "../../../api/users.api";
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
  const [endDate, setEndDate] = useState("");



  // Stats
  const [totalTracked, settotalTracked] = useState("");
  const [billableTime, setbillableTime] = useState("");
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
          setbillableTime(total);
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



 useEffect(() => {
  const fetchProject = async () => {
    if (!id) return;
    try {
      const res = await projectsAPI.getProjectById(id);
      const project = res.data || res;

      setProjectName(project.project_name || "");
      setStartDate(project.start_date ? project.start_date.split("T")[0] : "");
      setEndDate(project.end_date ? project.end_date.split("T")[0] : "");
      setClient(project.client_id ? String(project.client_id) : "");
      
      console.log("Fetched project client_id:", project.client_id);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  fetchProject();
}, [id]);

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

      const response = await clientsAPI.getClients();
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
      if (!id) {
        alert("Project ID is missing");
        return;
      }

      // Prepare the data in the correct format
      const updateData: any = {
        project_name: projectName,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
      };

      // Only include client_id if a client is selected
      if (client && client !== "") {
        updateData.client_id = Number(client);
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      console.log("Sending update data:", updateData);
      
      await projectsAPI.updateProject(id, updateData);
alert("Settings saved successfully!");
if (updateData.client_id) setClient(String(updateData.client_id));

      // alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
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
  <div className="">
    <h3 className="text-lg font-medium text-gray-700 mb-6">
      Project Settings
    </h3>
    <div className="h-[calc(100vh-150px)] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Client */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Client
          </label>
          {loadingClients ? (
            <div className="p-3 text-sm text-gray-500">Loading clients...</div>
          ) : clientsError ? (
            <div className="p-3 text-sm text-red-500">{clientsError}</div>
          ) : (
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm bg-white"
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
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="color"
            value={projectColor}
            onChange={(e) => setProjectColor(e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Hourly Rate */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (USD)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            step="0.01"
            className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate || today}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Billable */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
            className="w-4 h-4 text-cyan-400 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Billable</span>
        </div>

        {/* Non-Billable */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={isNonBillable}
            onChange={(e) => setIsNonBillable(e.target.checked)}
            className="w-4 h-4 text-cyan-400 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Non-Billable</span>
        </div>

        {/* Save Button - Full width */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-half py-3 px-6 bg-cyan-400 text-white font-semibold rounded uppercase text-sm hover:bg-cyan-500 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
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

