import React, { useContext, useEffect, useRef, useState } from 'react';
import fearlessVoiceLogo from '../../../assets/fearlessVoice.svg';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../../context/global-context';
import { Popconfirm } from 'antd';
import { useICWallet } from '../../../context/ic-wallet-context';
import { FiHome, FiFileText, FiFilePlus, FiLogOut, FiInfo, FiShield, FiList, FiX } from 'react-icons/fi';
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

    // Function to handle navigation and prevent unnecessary redirects
    const handleNavigation = (path, event) => {
        // If we're already on this path, prevent default behavior
        if (window.location.pathname === path) {
            event.preventDefault();
            return;
        }
        
        // Otherwise, navigate to the path
        navigate(path);
        
        // Close drawer on mobile if it exists
        if (drawer && typeof drawer.close === 'function' && window.innerWidth < 768) {
            drawer.close();
        }
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
        <div className='w-64 max-w-full bg-black min-h-screen h-full flex flex-col justify-between py-4 flex-shrink-0 border-r border-gray-800 text-white overflow-y-auto relative'>
            {/* Mobile close button - only visible in drawer mode */}
            {drawer && typeof drawer.isOpen === 'function' && drawer.isOpen() && (
                <button 
                    className="absolute top-2 right-2 text-white p-2 rounded-full hover:bg-gray-800 md:hidden"
                    onClick={() => drawer.close()}
                    aria-label="Close menu"
                >
                    <FiX className="w-5 h-5" />
                </button>
            )}
            
            <div>
                {/* Logo */}
                <Link to="/" onClick={(e) => handleNavigation('/', e)}>
                    <div className="mb-8 flex justify-center">
                        <img className='w-32 h-auto' src={fearlessVoiceLogo} alt="Fearless Voice" />
                    </div>
                </Link>
                
                {/* Navigation Links */}
                <div className="space-y-2 px-4">
                    {/* Removed Dashboard button as it's not being used */}
                    
                    <Link to="/feed" onClick={(e) => handleNavigation('/feed', e)} className="block">
                        <div className={`flex items-center gap-3 px-3 py-2 hover:text-[#fe570b] transition-colors rounded-md hover:bg-gray-900 ${window.location.pathname === '/feed' ? 'text-[#fe570b] bg-gray-900' : 'text-white'}`}>
                            <FiList className="h-5 w-5 flex-shrink-0" />
                            <span className="text-base truncate">Feed</span>
                        </div>
                    </Link>
                    
                    {/* Only show Reported Cases for non-admin users */}
                    {!isUserAdmin && (
                        <Link to="/dashboard/reported-cases" onClick={(e) => handleNavigation('/dashboard/reported-cases', e)} className="block">
                            <div className={`flex items-center gap-3 px-3 py-2 hover:text-[#fe570b] transition-colors rounded-md hover:bg-gray-900 ${window.location.pathname === '/dashboard/reported-cases' ? 'text-[#fe570b] bg-gray-900' : 'text-white'}`}>
                                <FiFileText className="h-5 w-5 flex-shrink-0" />
                                <span className="text-base truncate">Reported Cases</span>
                            </div>
                        </Link>
                    )}
                    
                    {/* Only show Submit Statement for non-admin users */}
                    {!isUserAdmin && (
                        <Link to="/dashboard/abuse-form" onClick={(e) => handleNavigation('/dashboard/abuse-form', e)} className="block">
                            <div className={`flex items-center gap-3 px-3 py-2 hover:text-[#fe570b] transition-colors rounded-md hover:bg-gray-900 ${window.location.pathname === '/dashboard/abuse-form' ? 'text-[#fe570b] bg-gray-900' : 'text-white'}`}>
                                <FiFilePlus className="h-5 w-5 flex-shrink-0" />
                                <span className="text-base truncate">Submit Report</span>
                            </div>
                        </Link>
                    )}
                    
                    {/* Admin Panel Link - Only visible to admin users */}
                    {isUserAdmin && (
                        <Link to="/dashboard/admin" onClick={(e) => handleNavigation('/dashboard/admin', e)} className="block">
                            <div className={`flex items-center gap-3 px-3 py-2 hover:text-[#fe570b] transition-colors rounded-md hover:bg-gray-900 ${window.location.pathname === '/dashboard/admin' ? 'text-[#fe570b] bg-gray-900' : 'text-white'}`}>
                                <FiShield className="h-5 w-5 flex-shrink-0" />
                                <span className="text-base truncate">Admin Panel</span>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Logout Button (only show if logged in) */}
            {isLoggedIn() && (
                <div className="px-4 mt-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-white hover:text-[#fe570b] transition-colors rounded-md hover:bg-gray-900"
                    >
                        <FiLogOut className="h-5 w-5 flex-shrink-0" />
                        <span className="text-base truncate">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Aside;