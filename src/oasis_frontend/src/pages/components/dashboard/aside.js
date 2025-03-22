import React, { useContext, useEffect, useRef, useState } from 'react';
import fearlessVoiceLogo from '../../../assets/fearlessVoice.svg';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../../context/global-context';
import { Popconfirm } from 'antd';
import { useICWallet } from '../../../context/ic-wallet-context';
import { FiHome, FiFileText, FiFilePlus, FiLogOut, FiInfo, FiShield } from 'react-icons/fi';
import { isAdmin } from '../../../functions/fn';

const Aside = () => {
    const { Aside, Storage, Admin, drawer } = useContext(GlobalContext);
    const { isConnected, disconnectPlug } = useICWallet();
    const isMounted = useRef(false);
    const navigate = useNavigate();
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    
    // Function to check if user is logged in
    const isLoggedIn = () => {
        // Check if user is in context
        if (!!Storage.user.get) {
            return true;
        }
        
        // If not in context, check localStorage
        if (typeof localStorage !== 'undefined' && localStorage.auth) {
            try {
                const authData = JSON.parse(localStorage.auth);
                return authData.status === "logged-in";
            } catch (e) {
                console.error("Error parsing auth data", e);
                return false;
            }
        }
        
        return false;
    };
    
    const handleLogout = async () => {
        // Disconnect from Plug wallet if connected
        if (isConnected) {
            await disconnectPlug();
        }
        
        // Clear localStorage
        localStorage.removeItem('auth');
        
        // Clear context
        if (Storage.user.get) {
            Storage.user.set(null);
        }
        
        // Redirect to landing page
        navigate('/');
    };
    
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        }
        
        // Check if user is admin
        const checkAdminStatus = async () => {
            try {
                const adminStatus = await isAdmin();
                setIsUserAdmin(adminStatus);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsUserAdmin(false);
            }
        };
        
        checkAdminStatus();
    }, [Storage.user.get]);
    
    return (
        <div className='bg-black h-screen flex flex-col justify-between py-6 flex-shrink-0 border-r border-gray-800 text-white'>
            <div>
                {/* Logo */}
                <Link to="/">
                    <div className="mb-12 flex justify-center">
                        <img className='w-24' src={fearlessVoiceLogo} alt="Fearless Voice" />
                    </div>
                </Link>
                
                {/* Navigation Links */}
                <div className="space-y-4 px-4">
                    <Link to="/" className="block">
                        <div className={`flex items-center gap-4 px-4 py-3 hover:text-[#fe570b] transition-colors ${window.location.pathname === '/' ? 'text-[#fe570b]' : 'text-white'}`}>
                            <FiHome className="h-6 w-6" />
                            <span className="text-lg">Dashboard</span>
                        </div>
                    </Link>
                    
                    <Link to="/dashboard/reported-cases" className="block">
                        <div className={`flex items-center gap-4 px-4 py-3 hover:text-[#fe570b] transition-colors ${window.location.pathname === '/dashboard/reported-cases' ? 'text-[#fe570b]' : 'text-white'}`}>
                            <FiFileText className="h-6 w-6" />
                            <span className="text-lg">Reported Cases</span>
                        </div>
                    </Link>
                    
                    <Link to="/dashboard/abuse-form" className="block">
                        <div className={`flex items-center gap-4 px-4 py-3 hover:text-[#fe570b] transition-colors ${window.location.pathname === '/dashboard/abuse-form' ? 'text-[#fe570b]' : 'text-white'}`}>
                            <FiFilePlus className="h-6 w-6" />
                            <span className="text-lg">Submit your statement</span>
                        </div>
                    </Link>
                    
                    <Link to="/" className="block">
                        <div className={`flex items-center gap-4 px-4 py-3 hover:text-[#fe570b] transition-colors ${window.location.pathname === '/' ? 'text-[#fe570b]' : 'text-white'}`}>
                            <FiInfo className="h-6 w-6" />
                            <span className="text-lg">About Us</span>
                        </div>
                    </Link>
                    
                    {/* Admin Panel Link - Now visible to all users */}
                    <Link to="/dashboard/admin" className="block">
                        <div className={`flex items-center gap-4 px-4 py-3 hover:text-[#fe570b] transition-colors ${window.location.pathname === '/dashboard/admin' ? 'text-[#fe570b]' : 'text-white'}`}>
                            <FiShield className="h-6 w-6" />
                            <span className="text-lg">Admin Panel</span>
                        </div>
                    </Link>
                </div>
            </div>
            
            {/* Logout Button (only show if logged in) */}
            {isLoggedIn() && (
                <div className="px-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 text-white hover:text-[#fe570b] transition-colors w-full"
                    >
                        <FiLogOut className="h-6 w-6" />
                        <span className="text-lg">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Aside;