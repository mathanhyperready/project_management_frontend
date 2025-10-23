import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Calendar as CalendarIcon } from "lucide-react";

interface ReportEntry {
  id: number;
  project: string;
  user: string;
  date: string;
  workedHours: number;
}

const ReportsPage: React.FC = () => {
  // Sample data - replace with actual data from your context/API
  const [reportData] = useState<ReportEntry[]>([
    { id: 1, project: "DEMO", user: "John Doe", date: "2025-10-20", workedHours: 3.5 },
    { id: 2, project: "TEST", user: "Jane Smith", date: "2025-10-20", workedHours: 5.0 },
    { id: 3, project: "DEMO", user: "John Doe", date: "2025-10-21", workedHours: 4.25 },
    { id: 4, project: "TEST", user: "Jane Smith", date: "2025-10-21", workedHours: 6.5 },
    { id: 5, project: "DEMO", user: "Bob Johnson", date: "2025-10-22", workedHours: 2.75 },
    { id: 6, project: "TEST", user: "John Doe", date: "2025-10-22", workedHours: 8.0 },
    { id: 7, project: "DEMO", user: "Jane Smith", date: "2025-10-23", workedHours: 7.0 },
  ]);

  // Get unique values for filters
  const projects = useMemo(() => 
    Array.from(new Set(reportData.map(entry => entry.project))),
    [reportData]
  );

  const users = useMemo(() => 
    Array.from(new Set(reportData.map(entry => entry.user))),
    [reportData]
  );

  // Filter states
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Dropdown states
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Filter and search data
  const filteredData = useMemo(() => {
    return reportData.filter((entry) => {
      const matchesProject = projectFilter === "all" || entry.project === projectFilter;
      const matchesUser = userFilter === "all" || entry.user === userFilter;
      
      const matchesDateRange = 
        (!startDate || entry.date >= startDate) &&
        (!endDate || entry.date <= endDate);
      
      const matchesSearch = 
        entry.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.date.includes(searchTerm);

      return matchesProject && matchesUser && matchesDateRange && matchesSearch;
    });
  }, [reportData, projectFilter, userFilter, startDate, endDate, searchTerm]);

  // Calculate total worked hours
  const totalHours = useMemo(() => {
    return filteredData.reduce((sum, entry) => sum + entry.workedHours, 0);
  }, [filteredData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleResetFilters = () => {
    setProjectFilter("all");
    setUserFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f3f4f6",
      padding: "2rem"
    }}>
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
          Reports
        </h1>
        <button
          onClick={() => window.print()}
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
          EXPORT REPORT
        </button>
      </div>

      {/* Filter Section */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}>
            <span style={{
              fontSize: "0.875rem",
              color: "#9ca3af",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              FILTERS
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}>
            {/* Project Filter */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "500",
                color: "#6b7280",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}>
                Project
              </label>
              <button
                onClick={() => {
                  setShowProjectDropdown(!showProjectDropdown);
                  setShowUserDropdown(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#374151",
                  textAlign: "left",
                }}
              >
                <span>{projectFilter === "all" ? "All Projects" : projectFilter}</span>
                <ChevronDown size={16} />
              </button>
              {showProjectDropdown && (
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
                  minWidth: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}>
                  <div
                    onClick={() => {
                      setProjectFilter("all");
                      setShowProjectDropdown(false);
                    }}
                    style={{
                      padding: "0.625rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#374151",
                      backgroundColor: projectFilter === "all" ? "#f3f4f6" : "white",
                    }}
                  >
                    All Projects
                  </div>
                  {projects.map((project) => (
                    <div
                      key={project}
                      onClick={() => {
                        setProjectFilter(project);
                        setShowProjectDropdown(false);
                      }}
                      style={{
                        padding: "0.625rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "#374151",
                        backgroundColor: projectFilter === project ? "#f3f4f6" : "white",
                      }}
                    >
                      {project}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Filter */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "500",
                color: "#6b7280",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}>
                User
              </label>
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowProjectDropdown(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#374151",
                  textAlign: "left",
                }}
              >
                <span>{userFilter === "all" ? "All Users" : userFilter}</span>
                <ChevronDown size={16} />
              </button>
              {showUserDropdown && (
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
                  minWidth: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}>
                  <div
                    onClick={() => {
                      setUserFilter("all");
                      setShowUserDropdown(false);
                    }}
                    style={{
                      padding: "0.625rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#374151",
                      backgroundColor: userFilter === "all" ? "#f3f4f6" : "white",
                    }}
                  >
                    All Users
                  </div>
                  {users.map((user) => (
                    <div
                      key={user}
                      onClick={() => {
                        setUserFilter(user);
                        setShowUserDropdown(false);
                      }}
                      style={{
                        padding: "0.625rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "#374151",
                        backgroundColor: userFilter === user ? "#f3f4f6" : "white",
                      }}
                    >
                      {user}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "500",
                color: "#6b7280",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}>
                Start Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "500",
                color: "#6b7280",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}>
                End Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Search and Action Buttons */}
          <div style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}>
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
                placeholder="Search by project, user, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem 0.625rem 2.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={handleResetFilters}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "transparent",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}>
        {/* Summary Bar */}
        <div style={{
          padding: "1rem 1.5rem",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            fontWeight: "500",
          }}>
            Showing {filteredData.length} entries
          </span>
          <span style={{
            fontSize: "0.875rem",
            color: "#374151",
            fontWeight: "600",
          }}>
            Total Hours: {totalHours.toFixed(2)}h
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  PROJECT
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
                  USER
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
                  DATE
                </th>
                <th style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "right",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  WORKED HOURS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                      fontWeight: "500",
                    }}>
                      {entry.project}
                    </td>
                    <td style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                    }}>
                      {entry.user}
                    </td>
                    <td style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                      textAlign: "right",
                      fontWeight: "500",
                    }}>
                      {entry.workedHours.toFixed(2)}h
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={4} 
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                    }}
                  >
                    No data found matching the selected filters
                  </td>
                </tr>
              )}
            </tbody>
            {/* Total Row */}
            {filteredData.length > 0 && (
              <tfoot>
                <tr style={{
                  backgroundColor: "#f9fafb",
                  borderTop: "2px solid #e5e7eb",
                  fontWeight: "600",
                }}>
                  <td 
                    colSpan={3} 
                    style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                      textAlign: "right",
                    }}
                  >
                    TOTAL
                  </td>
                  <td style={{
                    padding: "1rem 1.5rem",
                    fontSize: "0.875rem",
                    color: "#374151",
                    textAlign: "right",
                    fontWeight: "700",
                  }}>
                    {totalHours.toFixed(2)}h
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;