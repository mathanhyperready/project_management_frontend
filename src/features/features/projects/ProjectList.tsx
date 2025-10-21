import React, { useState, useEffect, useRef } from "react";
import { Search, Star, MoreVertical, ChevronDown, X } from "lucide-react";

interface Project {
  id: number;
  name: string;
  client: string;
  tracked: string;
  amount: string;
  progress: string;
  access: string;
  billable: boolean;
  active: boolean;
  favorite: boolean;
  color: string;
  startDate: string;
}

const ProjectsPage: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "DEMO",
      client: "",
      tracked: "3.01h",
      amount: "0.00 USD",
      progress: "-",
      access: "Public",
      billable: true,
      active: true,
      favorite: false,
      color: "#ec4899",
      startDate: "2025-10-01",
    },
    {
      id: 2,
      name: "TEST",
      client: "",
      tracked: "0.00h",
      amount: "0.00 USD",
      progress: "-",
      access: "Public",
      billable: false,
      active: true,
      favorite: false,
      color: "#10b981",
      startDate: "2025-10-05",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [billableFilter, setBillableFilter] = useState<string>("all");

  const [showActiveDropdown, setShowActiveDropdown] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showBillingDropdown, setShowBillingDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeProjectMenu, setActiveProjectMenu] = useState<number | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#8d6e63");

  // Form states
  const [projectName, setProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedColor, setSelectedColor] = useState("#a855f7");
  const [isPublic, setIsPublic] = useState(true);
  const [startDate, setStartDate] = useState("");

  const colors = [
    "#84cc16", "#ec4899", "#a855f7", "#3b82f6",
    "#06b6d4", "#22d3ee", "#14b8a6", "#f97316", "#9e9e9e"
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && project.active) ||
      (activeFilter === "inactive" && !project.active);
    const matchesClient = clientFilter === "all" || project.client === clientFilter;
    const matchesBillable = billableFilter === "all" ||
      (billableFilter === "billable" && project.billable) ||
      (billableFilter === "non-billable" && !project.billable);

    return matchesSearch && matchesActive && matchesClient && matchesBillable;
  });

  const toggleFavorite = (id: number) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, favorite: !p.favorite } : p
    ));
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setProjectName("");
    setSelectedClient("");
    setSelectedColor("#a855f7");
    setIsPublic(true);
    setStartDate("");
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setIsEditMode(true);
    setEditingProject(project);
    setProjectName(project.name);
    setSelectedClient(project.client);
    setSelectedColor(project.color);
    setIsPublic(project.access === "Public");
    setStartDate(project.startDate);
    setActiveProjectMenu(null);
    setShowModal(true);
  };

  const handleCreateProject = () => {
    if (projectName.trim()) {
      const newProject: Project = {
        id: Date.now(),
        name: projectName,
        client: selectedClient,
        tracked: "0.00h",
        amount: "0.00 USD",
        progress: "-",
        access: isPublic ? "Public" : "Private",
        billable: true,
        active: true,
        favorite: false,
        color: selectedColor,
        startDate: startDate || new Date().toISOString().split('T')[0],
      };
      setProjects([...projects, newProject]);
      setShowModal(false);
    }
  };

  const handleUpdateProject = () => {
    if (editingProject && projectName.trim()) {
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? {
              ...p,
              name: projectName,
              client: selectedClient,
              color: selectedColor,
              access: isPublic ? "Public" : "Private",
              startDate: startDate,
            }
          : p
      ));
      setShowModal(false);
    }
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
      setActiveProjectMenu(null);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Copy)`,
    };
    setProjects([...projects, newProject]);
    setActiveProjectMenu(null);
  };

  const handleExport = (format: string) => {
    alert(`Exporting projects as ${format}...`);
    setShowExportDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveProjectMenu(null);
        setShowActiveDropdown(false);
        setShowClientDropdown(false);
        setShowBillingDropdown(false);
        setShowExportDropdown(false);
        // Don't close color picker or modal here
      }
    };

    if (!showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f3f4f6",
      padding: "2rem"
    }}
    ref={menuRef}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "400",
          color: "#374151",
          margin: 0,
        }}>
          Projects
        </h1>
        <button
          onClick={openCreateModal}
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
          CREATE NEW PROJECT
        </button>
      </div>

      {/* Filter Section */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}>
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: "0.875rem",
            color: "#9ca3af",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            FILTER
          </span>

          {/* Active Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowActiveDropdown(!showActiveDropdown);
                setShowClientDropdown(false);
                setShowBillingDropdown(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#374151",
              }}
            >
              Active <ChevronDown size={16} />
            </button>
            {showActiveDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.25rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                minWidth: "150px",
              }}>
                <div
                  onClick={() => {
                    setActiveFilter("all");
                    setShowActiveDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: activeFilter === "all" ? "#f3f4f6" : "white",
                  }}
                >
                  All
                </div>
                <div
                  onClick={() => {
                    setActiveFilter("active");
                    setShowActiveDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: activeFilter === "active" ? "#f3f4f6" : "white",
                  }}
                >
                  Active
                </div>
                <div
                  onClick={() => {
                    setActiveFilter("inactive");
                    setShowActiveDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: activeFilter === "inactive" ? "#f3f4f6" : "white",
                  }}
                >
                  Inactive
                </div>
              </div>
            )}
          </div>

          {/* Client Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowClientDropdown(!showClientDropdown);
                setShowActiveDropdown(false);
                setShowBillingDropdown(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#374151",
              }}
            >
              Client <ChevronDown size={16} />
            </button>
            {showClientDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.25rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                minWidth: "150px",
              }}>
                <div
                  onClick={() => {
                    setClientFilter("all");
                    setShowClientDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: clientFilter === "all" ? "#f3f4f6" : "white",
                  }}
                >
                  All Clients
                </div>
                <div
                  onClick={() => {
                    setClientFilter("none");
                    setShowClientDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: clientFilter === "none" ? "#f3f4f6" : "white",
                  }}
                >
                  No Client
                </div>
              </div>
            )}
          </div>

          {/* Billing Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowBillingDropdown(!showBillingDropdown);
                setShowActiveDropdown(false);
                setShowClientDropdown(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#374151",
              }}
            >
              Billing <ChevronDown size={16} />
            </button>
            {showBillingDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.25rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                minWidth: "150px",
              }}>
                <div
                  onClick={() => {
                    setBillableFilter("all");
                    setShowBillingDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: billableFilter === "all" ? "#f3f4f6" : "white",
                  }}
                >
                  All
                </div>
                <div
                  onClick={() => {
                    setBillableFilter("billable");
                    setShowBillingDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: billableFilter === "billable" ? "#f3f4f6" : "white",
                  }}
                >
                  Billable
                </div>
                <div
                  onClick={() => {
                    setBillableFilter("non-billable");
                    setShowBillingDropdown(false);
                  }}
                  style={{
                    padding: "0.625rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    backgroundColor: billableFilter === "non-billable" ? "#f3f4f6" : "white",
                  }}
                >
                  Non billable
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div style={{
            flex: 1,
            position: "relative",
            minWidth: "250px",
          }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Find by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Apply Filter Button */}
          <button style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: "transparent",
            color: "#22d3ee",
            border: "1px solid #22d3ee",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            APPLY FILTER
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "visible",
      }}>
        {/* Tab Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <span style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            fontWeight: "500",
          }}>
            Projects
          </span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              style={{
                padding: "0.25rem 0.75rem",
                backgroundColor: "transparent",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              Export <ChevronDown size={14} />
            </button>
            {showExportDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.25rem",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                minWidth: "120px",
              }}>
                <div
                  onClick={() => handleExport("PDF")}
                  style={{
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  Export as PDF
                </div>
                <div
                  onClick={() => handleExport("CSV")}
                  style={{
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  Export as CSV
                </div>
                <div
                  onClick={() => handleExport("Excel")}
                  style={{
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  Export as Excel
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", width: "40px" }}>
                <input type="checkbox" style={{ cursor: "pointer" }} />
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                NAME ▲
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                CLIENT
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                TRACKED
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                AMOUNT
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                PROGRESS
              </th>
              <th style={{
                padding: "0.75rem 1.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                ACCESS
              </th>
              <th style={{ padding: "0.75rem 1.5rem", width: "80px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <input type="checkbox" style={{ cursor: "pointer" }} />
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: project.color,
                    }}></span>
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                      {project.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
                  {project.client || "–"}
                </td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  {project.tracked}
                </td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  {project.amount}
                </td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
                  {project.progress}
                </td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  {project.access}
                </td>
                <td style={{ padding: "1rem 1.5rem", position: "relative" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", position: "relative" }}>
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                    >
                      <Star
                        size={18}
                        style={{
                          color: project.favorite ? "#fbbf24" : "#d1d5db",
                          fill: project.favorite ? "#fbbf24" : "none",
                        }}
                      />
                    </button>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setActiveProjectMenu(activeProjectMenu === project.id ? null : project.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.25rem",
                        }}
                      >
                        <MoreVertical size={18} style={{ color: "#9ca3af" }} />
                      </button>
                      {activeProjectMenu === project.id && (
                        <div style={{
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
                        }}>
                          <div
                            onClick={() => openEditModal(project)}
                            style={{
                              padding: "0.75rem 1.25rem",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              color: "#374151",
                              transition: "background-color 0.15s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            Edit
                          </div>
                          <div
                            onClick={() => handleDuplicateProject(project)}
                            style={{
                              padding: "0.75rem 1.25rem",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              color: "#374151",
                              transition: "background-color 0.15s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            Duplicate
                          </div>
                          <div
                            onClick={() => handleDeleteProject(project.id)}
                            style={{
                              padding: "0.75rem 1.25rem",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              color: "#ef4444",
                              transition: "background-color 0.15s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: "500",
                color: "#6b7280",
              }}>
                {isEditMode ? "Edit Project" : "Create new Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  color: "#9ca3af",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {/* Project Name */}
                <input
                  type="text"
                  placeholder="Enter Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />

                {/* Client Dropdown */}
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    color: "#9ca3af",
                  }}
                >
                  <option value="">Select client</option>
                  <option value="Client A">Client A</option>
                  <option value="Client B">Client B</option>
                  <option value="Client C">Client C</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
                {/* Color Picker */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: selectedColor,
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <ChevronDown size={16} style={{ color: "white", position: "absolute", bottom: "2px", right: "2px" }} />
                  </button>
                  {showColorPicker && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.5rem",
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      padding: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              setShowColorPicker(false);
                            }}
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: color,
                              border: selectedColor === color ? "2px solid #374151" : "1px solid #d1d5db",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ 
                        paddingTop: "0.5rem", 
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Custom</span>
                        <input
                          type="checkbox"
                          checked={showCustomColorPicker}
                          onChange={(e) => setShowCustomColorPicker(e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        <button
                          onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                          style={{
                            width: "24px",
                            height: "24px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "white",
                            fontSize: "1rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                      {showCustomColorPicker && (
                        <div style={{
                          marginTop: "0.75rem",
                          padding: "0.75rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb",
                        }}>
                          <div style={{
                            width: "180px",
                            height: "180px",
                            background: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1)),
                                       linear-gradient(to right, rgba(255,255,255,1), transparent)`,
                            borderRadius: "4px",
                            position: "relative",
                            marginBottom: "0.75rem",
                            cursor: "crosshair",
                          }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            // Simplified color calculation
                            const lightness = Math.round((1 - y / 180) * 50 + 25);
                            const saturation = Math.round((x / 180) * 100);
                            setCustomColor(`hsl(30, ${saturation}%, ${lightness}%)`);
                          }}
                          >
                            <div style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid white",
                              borderRadius: "50%",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              pointerEvents: "none",
                            }}></div>
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}>
                            <div style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: customColor,
                              border: "1px solid #d1d5db",
                              borderRadius: "50%",
                            }}></div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              defaultValue="30"
                              onChange={(e) => {
                                setCustomColor(`hsl(${e.target.value}, 70%, 50%)`);
                              }}
                              style={{
                                flex: 1,
                                height: "8px",
                                background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                                borderRadius: "4px",
                                outline: "none",
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input
                              type="text"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "0.5rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                textAlign: "center",
                              }}
                            />
                            <button
                              onClick={() => {
                                setSelectedColor(customColor);
                                setShowColorPicker(false);
                                setShowCustomColorPicker(false);
                              }}
                              style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#22d3ee",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Public Checkbox */}
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#374151",
                }}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#22d3ee",
                    }}
                  />
                  Public
                </label>
              </div>

              {/* Start Date */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
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
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "1.5rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.5rem 1.5rem",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                }}
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleUpdateProject : handleCreateProject}
                style={{
                  padding: "0.5rem 1.5rem",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "#22d3ee",
                  color: "white",
                  textTransform: "uppercase",
                }}
              >
                {isEditMode ? "SAVE" : "CREATE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;