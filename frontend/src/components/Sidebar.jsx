import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

function Sidebar({
  token,
  handleLogout,
  isOpen,
  toggleSidebar,
  onOpenProfile,
  theme,
  toggleTheme,
  projects,
  fetchProjects,
  selectedProjectId,
  setSelectedProjectId
}) {
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState(null);

  // Setup Axios Auth Header
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const decodedToken = jwtDecode(token);
  const user = decodedToken?.user || {};

  useEffect(() => {
    if (user.teamId) {
      fetchTeamData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.teamId]);

  const fetchTeamData = async () => {
    try {
      const res = await axios.get('/api/auth/team', authConfig);
      setTeamData(res.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/team/create', { teamName }, authConfig);
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/team/join', { teamCode: joinCode }, authConfig);
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Invalid Team Code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (teamData?.code) {
      navigator.clipboard.writeText(teamData.code);
      alert(`Invite code "${teamData.code}" copied to clipboard! Share it with your team.`);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/projects', { name: projectName, description: projectDesc }, authConfig);
      setProjectName('');
      setProjectDesc('');
      setIsCreatingProject(false);
      await fetchProjects();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleKickMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      await axios.delete(`/api/auth/team/kick/${memberId}`, authConfig);
      const res = await axios.get('/api/auth/team', authConfig);
      setTeamData(res.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleDeleteProject = async (e, projectId, pName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the project '${pName}' and all its tickets?`)) return;

    setLoading(true);
    try {
      await axios.delete(`/api/projects/${projectId}`, authConfig);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      await fetchProjects();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[85vw] max-w-sm sm:w-80 h-[100dvh] theme-panel backdrop-blur-3xl shadow-2xl theme-text md:relative transform transition-all duration-300 ease-out shrink-0 border-r-2 theme-border md:rounded-r-3xl overflow-hidden ${
          isOpen
            ? 'translate-x-0 opacity-100 md:w-80'
            : '-translate-x-full opacity-0 md:border-none md:w-0 md:translate-x-0'
        }`}
      >
        <div className="w-[85vw] max-w-sm sm:w-80 h-full flex flex-col shrink-0 relative p-6 custom-scrollbar overflow-y-auto">
          
          {/* Close Sidebar Trigger */}
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 p-2 rounded-xl theme-panel theme-border border theme-muted hover:text-red-500 transition-colors z-20"
            title="Close Sidebar"
          >
            ✕
          </button>

          {/* Logo & Header */}
          <div className="mb-6 shrink-0 pr-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#facc15] text-[#08241b] font-syne font-black flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div>
                <span className="font-syne font-black text-xl tracking-tight theme-text block leading-none">
                  SyncIssue
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#22c55e] font-bold block mt-0.5">
                  NATURE-TECH PORTAL
                </span>
              </div>
            </Link>
          </div>

          {!user.teamId ? (
            <div className="flex-1 space-y-6">
              {/* Create Team State */}
              <div className="theme-panel p-5 rounded-2xl border theme-border shadow-inner">
                <h3 className="font-syne font-bold text-sm theme-text mb-3 flex items-center gap-2">
                  <span>🚀</span>
                  <span>Create Workspace</span>
                </h3>
                <form onSubmit={handleCreateTeam} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Workspace Name"
                    className="w-full theme-input rounded-xl p-2.5 text-xs font-medium border theme-border focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                  />
                  <button
                    disabled={loading}
                    className="w-full bg-[#facc15] text-[#08241b] font-syne font-extrabold py-2.5 rounded-xl text-xs shadow-md hover:scale-105 transition-transform"
                  >
                    {loading ? 'Creating...' : 'Create & Become Admin'}
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono theme-muted tracking-widest uppercase">
                <div className="h-px border-t theme-border flex-1" />
                <span>OR</span>
                <div className="h-px border-t theme-border flex-1" />
              </div>

              {/* Join Team State */}
              <div className="theme-panel p-5 rounded-2xl border theme-border shadow-inner">
                <h3 className="font-syne font-bold text-sm theme-text mb-1 flex items-center gap-2">
                  <span>🤝</span>
                  <span>Join Team</span>
                </h3>
                <p className="text-[10px] theme-muted font-sans mb-3">
                  Enter the 6-character invite code from your admin.
                </p>
                <form onSubmit={handleJoinTeam} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALPHA1"
                    maxLength={6}
                    className="w-full theme-input rounded-xl p-2.5 text-xs font-mono font-bold tracking-widest text-center border theme-border uppercase focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                  />
                  <button
                    disabled={loading}
                    className="w-full bg-[#22c55e] text-[#08241b] font-syne font-extrabold py-2.5 rounded-xl text-xs shadow-md hover:scale-105 transition-transform"
                  >
                    {loading ? 'Joining...' : 'Join Workspace'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-6 min-h-0">
              
              {/* User Profile Card */}
              <div className="theme-panel p-4 rounded-2xl border-2 theme-border flex items-center gap-3 relative overflow-hidden shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[#0d382b] text-[#facc15] border-2 border-[#22c55e]/40 font-syne font-black text-base flex items-center justify-center shadow-md shrink-0">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-syne font-bold text-sm theme-text truncate">
                    {user.username}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        user.role === 'Admin'
                          ? 'bg-[#facc15]/20 text-[#facc15] border border-[#facc15]/30'
                          : 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1 text-xs font-mono">
                  <span className="font-bold theme-muted uppercase tracking-wider">Project Scopes</span>
                  <span className="theme-bg px-2 py-0.5 rounded-full font-bold theme-border border text-[10px]">
                    {projects?.length || 0}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {projects?.length === 0 ? (
                    <p className="text-xs font-sans theme-muted p-2">No projects yet. Create one below.</p>
                  ) : (
                    projects.map(project => (
                      <div
                        key={project._id}
                        onClick={() => setSelectedProjectId(project._id)}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                          selectedProjectId === project._id
                            ? 'bg-[#22c55e]/20 border-2 border-[#22c55e] text-[#facc15] font-bold shadow-sm translate-x-1'
                            : 'theme-panel theme-border border hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                          <span className="text-xs">🗂️</span>
                          <p className="text-xs truncate font-syne">{project.name}</p>
                        </div>

                        {(user.role === 'Admin' || project.createdBy === user.id) && (
                          <button
                            onClick={e => handleDeleteProject(e, project._id, project.name)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors shrink-0 text-xs"
                            title="Delete Project"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {isCreatingProject ? (
                  <form onSubmit={handleCreateProject} className="theme-panel border-2 theme-border p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold theme-muted">
                      <span>NEW PROJECT</span>
                      <button type="button" onClick={() => setIsCreatingProject(false)}>✕</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Project Name"
                      required
                      autoFocus
                      className="w-full theme-input rounded-lg p-2 text-xs border theme-border font-medium focus:ring-1 focus:ring-[#22c55e]"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                    />
                    <button
                      disabled={loading}
                      className="w-full bg-[#22c55e] text-[#08241b] font-syne font-bold text-xs py-2 rounded-lg"
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="w-full py-2 theme-panel hover:bg-[#22c55e]/15 theme-border border text-xs font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>+</span>
                    <span>New Project Scope</span>
                  </button>
                )}
              </div>

              {/* Team Members */}
              {teamData?.members && teamData.members.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1 text-xs font-mono">
                    <span className="font-bold theme-muted uppercase tracking-wider">Team Roster</span>
                    <span className="theme-bg px-2 py-0.5 rounded-full font-bold theme-border border text-[10px]">
                      {teamData.members.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {teamData.members.map(member => (
                      <div
                        key={member._id}
                        className="flex items-center gap-2.5 p-2 rounded-xl theme-panel border theme-border group text-xs font-mono"
                      >
                        <div className="w-6 h-6 rounded-md bg-[#0d382b] text-[#a7f3d0] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-bold theme-text">{member.username}</p>
                          <p className="text-[9px] theme-muted opacity-70">{member.role}</p>
                        </div>

                        {user.role === 'Admin' && member._id !== user.id && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleKickMember(member._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 text-xs"
                            title="Remove Member"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Invite Code Badge */}
              {user.role === 'Admin' && (
                <div className="p-3.5 bg-[#facc15]/10 rounded-2xl border-2 border-[#facc15]/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#facc15]">
                    <span>INVITE CODE</span>
                    <span className="text-[9px] opacity-70">6 CHAR</span>
                  </div>
                  <div className="theme-input p-2 rounded-xl text-center font-mono font-black text-lg tracking-widest text-[#facc15] border theme-border">
                    {teamData?.code || 'ALPHA1'}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#08241b] font-syne font-black text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>📋 Copy Invite Code</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Sidebar Footer */}
          <div className="mt-auto pt-4 border-t theme-border space-y-2 shrink-0">
            <Link
              to="/"
              className="w-full py-2.5 theme-panel hover:bg-[#22c55e]/15 border theme-border text-xs font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>🌿</span>
              <span>Back to Landing</span>
            </Link>

            <button
              onClick={onOpenProfile}
              className="w-full py-2.5 theme-panel hover:bg-[#22c55e]/15 border theme-border text-xs font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;
