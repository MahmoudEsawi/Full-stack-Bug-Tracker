import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Sidebar({ token, handleLogout, isOpen, toggleSidebar, onOpenProfile, theme, toggleTheme, projects, fetchProjects, selectedProjectId, setSelectedProjectId }) {
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
            console.log("Fetching team data... Token:", token.substring(0, 10));
            const res = await axios.get('/api/auth/team', authConfig);
            console.log("Fetched team data:", res.data);
            setTeamData(res.data);
        } catch (error) {
            console.error("Error fetching team data:", error);
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
            alert(error.response?.data?.message || "Failed to create team.");
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
            alert(error.response?.data?.message || "Invalid Team Code.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (teamData?.code) {
            navigator.clipboard.writeText(teamData.code);
            alert(`Invite code ${teamData.code} copied to clipboard! Share it with your team.`);
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
            alert(error.response?.data?.message || "Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    const handleKickMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member from the team?")) return;

        try {
            await axios.delete(`/api/auth/team/kick/${memberId}`, authConfig);
            // Refresh team data
            const res = await axios.get('/api/auth/team', authConfig);
            setTeamData(res.data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to remove member.");
        }
    };

    return (
        <>
            {/* Mobile Overlay Background - Only shown when Sidebar is open on small screens */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-80 h-[100dvh] p-6 theme-panel backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.5)] custom-scrollbar theme-text md:relative transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 overflow-y-auto theme-border md:rounded-r-[2rem] 
              ${isOpen
                    ? 'translate-x-0 border-r opacity-100 md:ml-0'
                    : '-translate-x-full opacity-0 md:border-none md:-ml-80'
                }
            `}>

                {/* Close Button (Visible on all screens to hide the Sidebar) */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-6 right-6 theme-bg theme-border border p-2 rounded-xl theme-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Close Sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-10 text-center md:text-left mt-4 md:mt-0 relative shrink-0">
                    <div className="absolute top-1/2 left-4 w-12 h-12 bg-indigo-500/20 blur-[20px] rounded-full pointer-events-none -translate-y-1/2"></div>
                    <h1 className="text-3xl font-black theme-text tracking-tight flex items-center justify-center md:justify-start gap-2 relative z-10 w-max">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50">N</span>
                        Nexus<span className="text-fuchsia-500 text-lg">v2</span>
                    </h1>
                    <p className="theme-muted text-xs mt-2 uppercase tracking-widest font-bold w-max">Workspace Portal</p>
                </div>

                {!user.teamId ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                        {/* No Team State */}
                        <div className="theme-panel p-6 rounded-2xl shadow-inner">
                            <h3 className="theme-text font-bold mb-4 flex items-center gap-2">
                                <span className="text-xl">🚀</span> Create Workspace
                            </h3>
                            <form onSubmit={handleCreateTeam} className="flex flex-col gap-3">
                                <input
                                    type="text" required placeholder="Enter Workspace Name"
                                    className="w-full theme-input rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                    value={teamName} onChange={e => setTeamName(e.target.value)}
                                />
                                <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all text-sm">
                                    {loading ? 'Processing...' : 'Create & Become Admin'}
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center gap-4 theme-muted text-[10px] font-black tracking-widest uppercase w-full">
                            <div className="h-px theme-border border-t flex-1"></div>
                            <span>OR</span>
                            <div className="h-px theme-border border-t flex-1"></div>
                        </div>

                        <div className="theme-panel p-6 rounded-2xl shadow-inner">
                            <h3 className="theme-text font-bold mb-4 flex items-center gap-2">
                                <span className="text-xl">🤝</span> Join Existing Team
                            </h3>
                            <p className="text-[11px] theme-muted mb-4 leading-relaxed font-medium">Ask your Team Admin for the 6-character Unique Invite Code.</p>
                            <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                                <input
                                    type="text" required placeholder="e.g. A1B2C3" maxLength={6}
                                    className="w-full theme-input rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono tracking-widest text-center transition-all"
                                    value={joinCode} onChange={e => setJoinCode(e.target.value)}
                                />
                                <button disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all text-sm">
                                    {loading ? 'Verifying...' : 'Join Workspace'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-between">
                        {/* Active Team State */}
                        <div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl mb-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[40px] rounded-full"></div>
                                <div className="w-16 h-16 bg-indigo-500 border border-indigo-400/50 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3 shadow-[0_0_20px_rgba(99,102,241,0.5)] relative z-10">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="theme-text font-bold text-lg relative z-10">{user.username}</h2>
                                <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest relative z-10 ${user.role === 'Admin' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'theme-panel theme-muted'}`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 theme-panel rounded-xl shadow-inner">
                                    <span className="text-sm font-medium theme-muted">Status</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 tracking-wider uppercase">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Online
                                    </span>
                                </div>

                                {/* Projects Section */}
                                <div className="mt-8 mb-4">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-[10px] font-black theme-muted uppercase tracking-widest">Projects</h3>
                                        <span className="theme-bg theme-border border text-xs px-2 py-0.5 rounded-full font-bold theme-muted">{projects?.length || 0}</span>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 mb-4">
                                        {projects?.length === 0 ? (
                                            <p className="text-xs theme-muted font-medium">No projects found. Create one below.</p>
                                        ) : (
                                            projects.map(project => (
                                                <div
                                                    key={project._id}
                                                    onClick={() => setSelectedProjectId(project._id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${selectedProjectId === project._id ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] translate-x-1' : 'theme-panel theme-border border hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${selectedProjectId === project._id ? 'bg-indigo-500 text-white' : 'theme-bg theme-border border theme-muted group-hover:border-indigo-500/50 group-hover:text-indigo-400'}`}>
                                                        {project.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold truncate transition-colors ${selectedProjectId === project._id ? 'text-indigo-500' : 'theme-text group-hover:text-indigo-400'}`}>{project.name}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {isCreatingProject ? (
                                        <form onSubmit={handleCreateProject} className="theme-panel border border-indigo-500/30 p-3.5 rounded-xl flex flex-col gap-3 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">New Project</span>
                                                <button type="button" onClick={() => setIsCreatingProject(false)} className="theme-muted hover:text-red-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <input type="text" placeholder="Project Name" required autoFocus className="theme-input theme-border border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" value={projectName} onChange={e => setProjectName(e.target.value)} />
                                            <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)] text-xs font-bold py-2.5 rounded-lg transition-all">
                                                {loading ? 'Creating...' : 'Create Project'}
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setIsCreatingProject(true)}
                                            className="w-full theme-bg hover:theme-panel theme-muted hover:text-indigo-500 theme-border border text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                            Create Project
                                        </button>
                                    )}
                                </div>

                                {/* Team Members List */}
                                {teamData?.members && teamData.members.length > 0 && (
                                    <div className="mt-8 mb-4">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h3 className="text-[10px] font-black theme-muted uppercase tracking-widest">Team Members</h3>
                                            <span className="theme-bg theme-border border text-xs px-2 py-0.5 rounded-full font-bold theme-muted">{teamData.members.length}</span>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {teamData.members.map(member => (
                                                <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl theme-panel theme-border border hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors group">
                                                    <div className="w-8 h-8 rounded-full theme-bg theme-border border flex items-center justify-center text-xs font-bold theme-muted shadow-sm group-hover:border-indigo-500/50 transition-colors shrink-0">
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold theme-text truncate group-hover:text-indigo-400 transition-colors">{member.username}</p>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${member.role === 'Admin' ? 'text-amber-500' : 'theme-muted'}`}>
                                                            {member.role}
                                                        </p>
                                                    </div>

                                                    {/* Kick Member Button (Only Admin sees it, and cannot kick themselves) */}
                                                    {user.role === 'Admin' && member._id !== user.id && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleKickMember(member._id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 theme-muted hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                                            title={`Kick ${member.username}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Only Admins can see raw invite code concepts */}
                                {user.role === 'Admin' && (
                                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 mt-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none"></div>
                                        <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 relative z-10">Team Management</span>
                                        <p className="text-[11px] text-amber-500/80 mb-4 leading-relaxed font-medium relative z-10">As an Admin, share this invite code to add members.</p>

                                        <div className="theme-input border border-amber-500/30 rounded-lg p-3 flex justify-center items-center mb-3 shadow-inner relative z-10">
                                            <span className="font-mono text-amber-500 font-black tracking-widest text-xl">{teamData?.code || "Loading..."}</span>
                                        </div>

                                        <button
                                            onClick={handleCopyCode}
                                            className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-bold py-2.5 rounded-lg text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 relative z-10"
                                        >
                                            Copy Invite Code
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Area */}
                <div className="mt-auto pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full mb-3 flex items-center justify-center gap-2 theme-input hover:theme-panel theme-muted hover:text-red-500 theme-border border hover:border-red-500/30 py-3 rounded-xl font-bold transition-all text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign Out
                    </button>

                    <button
                        onClick={onOpenProfile}
                        className="w-full flex items-center justify-center gap-2 theme-bg hover:theme-panel theme-muted hover:text-indigo-500 theme-border border hover:border-indigo-500/30 py-3 rounded-xl font-bold transition-all text-sm mb-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Profile Settings
                    </button>
                </div>

            </aside>
        </>
    );
}

export default Sidebar;
