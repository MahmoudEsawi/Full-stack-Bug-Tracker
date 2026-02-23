import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Sidebar({ token, handleLogout }) {
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
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
    }, [user.teamId]);

    const fetchTeamData = async () => {
        try {
            const res = await axios.get('/api/auth/team', authConfig);
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

    return (
        <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300 md:h-screen sticky top-0 md:rounded-r-[2rem] shadow-2xl p-8 z-50">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">N</span>
                    Nexus<span className="text-blue-500 text-lg">v2</span>
                </h1>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Workspace Portal</p>
            </div>

            {!user.teamId ? (
                <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                    {/* No Team State */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="text-xl">🚀</span> Create Workspace
                        </h3>
                        <form onSubmit={handleCreateTeam} className="flex flex-col gap-3">
                            <input
                                type="text" required placeholder="Enter Workspace Name"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500"
                                value={teamName} onChange={e => setTeamName(e.target.value)}
                            />
                            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors text-sm">
                                {loading ? 'Processing...' : 'Create & Become Admin'}
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase w-full">
                        <div className="h-px bg-slate-700 flex-1"></div>
                        <span>OR</span>
                        <div className="h-px bg-slate-700 flex-1"></div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="text-xl">🤝</span> Join Existing Team
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">Ask your Team Admin for the 6-character Unique Invite Code.</p>
                        <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                            <input
                                type="text" required placeholder="e.g. A1B2C3" maxLength={6}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500 uppercase font-mono tracking-widest text-center"
                                value={joinCode} onChange={e => setJoinCode(e.target.value)}
                            />
                            <button disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-colors text-sm">
                                {loading ? 'Verifying...' : 'Join Workspace'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    {/* Active Team State */}
                    <div>
                        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl mb-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg shadow-blue-500/30">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-white font-bold text-lg">{user.username}</h2>
                            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}`}>
                                {user.role} Role
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <span className="text-sm font-medium text-slate-400">Status</span>
                                <span className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                                </span>
                            </div>

                            {/* Only Admins can see raw invite code concepts */}
                            {user.role === 'Admin' && teamData?.code && (
                                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <span className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Team Management</span>
                                    <p className="text-xs text-amber-200/70 mb-3 leading-relaxed">As an Admin, you can invite members to this workspace.</p>

                                    <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-3 flex justify-between items-center mb-3">
                                        <span className="font-mono text-amber-500 font-bold tracking-widest text-lg">{teamData.code}</span>
                                    </div>

                                    <button
                                        onClick={handleCopyCode}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
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
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 py-3 rounded-xl font-bold transition-all text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;
