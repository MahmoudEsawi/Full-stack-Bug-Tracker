import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Sidebar({ token, handleLogout, isOpen, toggleSidebar, onOpenProfile, theme, toggleTheme, projects, fetchProjects, selectedProjectId, setSelectedProjectId }) {
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
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
            await fetchProjects();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay Background */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`fixed md:sticky top-0 left-0 w-80 glass-panel border-r border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex flex-col h-screen text-slate-300 md:rounded-r-[2rem] p-8 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* Mobile Close Button */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-800/50 border border-slate-700 p-2 rounded-xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-10 text-center md:text-left mt-4 md:mt-0 relative">
                    <div className="absolute top-1/2 left-4 w-12 h-12 bg-indigo-500/20 blur-[20px] rounded-full pointer-events-none -translate-y-1/2"></div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2 relative z-10">
                        <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50">N</span>
                        Nexus<span className="text-fuchsia-400 text-lg">v2</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Workspace Portal</p>
                </div>

                {!user.teamId ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                        {/* No Team State */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="text-xl">🚀</span> Create Workspace
                            </h3>
                            <form onSubmit={handleCreateTeam} className="flex flex-col gap-3">
                                <input
                                    type="text" required placeholder="Enter Workspace Name"
                                    className="w-full bg-[#050511] border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600 transition-all"
                                    value={teamName} onChange={e => setTeamName(e.target.value)}
                                />
                                <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all text-sm">
                                    {loading ? 'Processing...' : 'Create & Become Admin'}
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center gap-4 text-slate-600 text-[10px] font-black tracking-widest uppercase w-full">
                            <div className="h-px bg-slate-800/80 flex-1"></div>
                            <span>OR</span>
                            <div className="h-px bg-slate-800/80 flex-1"></div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="text-xl">🤝</span> Join Existing Team
                            </h3>
                            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-medium">Ask your Team Admin for the 6-character Unique Invite Code.</p>
                            <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                                <input
                                    type="text" required placeholder="e.g. A1B2C3" maxLength={6}
                                    className="w-full bg-[#050511] border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-600 uppercase font-mono tracking-widest text-center transition-all"
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
                                <div className="w-16 h-16 bg-indigo-600 border border-indigo-400/50 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3 shadow-[0_0_20px_rgba(99,102,241,0.5)] relative z-10">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-white font-bold text-lg relative z-10">{user.username}</h2>
                                <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest relative z-10 ${user.role === 'Admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-inner">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span> Online
                                    </span>
                                </div>

                                {/* Projects Section */}
                                <div className="mt-8 mb-4">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projects</h3>
                                        <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{projects?.length || 0}</span>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 mb-4">
                                        {projects?.length === 0 ? (
                                            <p className="text-xs text-slate-500 font-medium">No projects found.</p>
                                        ) : (
                                            projects.map(project => (
                                                <div
                                                    key={project._id}
                                                    onClick={() => setSelectedProjectId(project._id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${selectedProjectId === project._id ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-slate-900/40 border border-slate-700/30 hover:bg-slate-800'}`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#050511] border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm group-hover:border-indigo-500/50 transition-colors">
                                                        {project.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold truncate transition-colors ${selectedProjectId === project._id ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'}`}>{project.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{project.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleCreateProject} className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl flex flex-col gap-2 shadow-inner">
                                        <input type="text" placeholder="Project Name" required className="bg-[#050511] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={projectName} onChange={e => setProjectName(e.target.value)} />
                                        <button disabled={loading} className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-bold py-2 rounded-lg transition-colors">
                                            {loading ? 'Creating...' : '+ New Project'}
                                        </button>
                                    </form>
                                </div>

                                {/* Team Members List */}
                                {teamData?.members && teamData.members.length > 0 && (
                                    <div className="mt-8 mb-4">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Members</h3>
                                            <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{teamData.members.length}</span>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {teamData.members.map(member => (
                                                <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/30 hover:bg-slate-800 transition-colors group">
                                                    <div className="w-8 h-8 rounded-full bg-[#050511] border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm group-hover:border-indigo-500/50 transition-colors">
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{member.username}</p>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${member.role === 'Admin' ? 'text-amber-500/80' : 'text-slate-500'}`}>
                                                            {member.role}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Only Admins can see raw invite code concepts */}
                                {user.role === 'Admin' && (
                                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 mt-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none"></div>
                                        <span className="block text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-2 relative z-10">Team Management</span>
                                        <p className="text-[11px] text-amber-200/60 mb-4 leading-relaxed font-medium relative z-10">As an Admin, share this invite code to add members.</p>

                                        <div className="bg-[#050511] border border-amber-500/30 rounded-lg p-3 flex justify-center items-center mb-3 shadow-inner relative z-10">
                                            <span className="font-mono text-amber-500 font-black tracking-widest text-xl">{teamData?.code || "Loading..."}</span>
                                        </div>

                                        <button
                                            onClick={handleCopyCode}
                                            className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2.5 rounded-lg text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 relative z-10"
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
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-500/30 py-3 rounded-xl font-bold transition-all text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign Out
                    </button>

                    <button
                        onClick={onOpenProfile}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-300 border border-slate-700/80 hover:border-indigo-500/30 py-3 rounded-xl font-bold transition-all text-sm mb-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Profile Settings
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/30 py-3 rounded-xl font-bold transition-all text-sm"
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                                Light Mode
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                                Dark Mode
                            </>
                        )}
                    </button>
                </div>

            </aside>
        </>
    );
}

export default Sidebar;
