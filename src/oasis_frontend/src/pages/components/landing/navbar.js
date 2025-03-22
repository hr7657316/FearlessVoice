import React, { useContext, useState, useEffect } from 'react';
import logo from '../../../assets/Logo.svg'
import fearlessVoiceLogo from '../../../assets/fearlessVoice.svg'
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../../context/global-context';
import { useICWallet } from '../../../context/ic-wallet-context';
import { Dropdown, Menu, Button, Tooltip, Space } from 'antd';
import { FiUser, FiLogOut, FiSettings, FiClipboard, FiExternalLink } from 'react-icons/fi';

const Navbar = () => {
    const { Storage } = useContext(GlobalContext);
    const { 
        principal, 
        accountId, 
        isConnected, 
        isConnecting, 
        connectPlug, 
        disconnectPlug 
    } = useICWallet();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('User');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated with Plug wallet
        if (isConnected && principal) {
            setIsLoggedIn(true);
            setUserName(principal.substring(0, 8) + '...');

            // Update global context if needed
            if (!Storage.user.get) {
                Storage.user.set({
                    principal,
                    accountId
                });
            }
        } else {
            checkLocalStorage();
        }
    }, [isConnected, principal, accountId, Storage.user]);

    const checkLocalStorage = () => {
        // If not connected through Plug, check localStorage
        if (typeof localStorage !== 'undefined' && localStorage.auth) {
            try {
                const authData = JSON.parse(localStorage.auth);
                if (authData.status === "logged-in") {
                    setIsLoggedIn(true);
                    
                    // Get user info from storage
                    if (authData.userInfo) {
                        if (authData.userInfo.principal) {
                            setUserName(authData.userInfo.principal.substring(0, 8) + '...');
                        } else if (authData.userInfo.phone && authData.userInfo.phone !== null) {
                            setUserName(authData.userInfo.phone);
                        } else {
                            setUserName('User'); // Default fallback
                        }
                        
                        // Update global context if not already set
                        if (!Storage.user.get) {
                            Storage.user.set(authData.userInfo);
                        }
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch (e) {
                console.error("Error parsing auth data", e);
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    };

    const handleLogout = async () => {
        // Disconnect from Plug wallet
        if (isConnected) {
            await disconnectPlug();
        }
        
        // Clear localStorage
        localStorage.removeItem('auth');
        
        // Update state
        setIsLoggedIn(false);
        
        // Clear context
        if (Storage.user.get) {
            Storage.user.set(null);
        }
        
        // Redirect to landing page
        navigate('/');
    };
    
    const userMenu = (
        <Menu>
            {principal && (
                <Menu.Item key="principal" icon={<FiClipboard />}>
                    <Tooltip title="Copy Principal ID">
                        <div onClick={() => {
                            navigator.clipboard.writeText(principal);
                        }}>
                            Principal ID: {principal.substring(0, 8)}...
                        </div>
                    </Tooltip>
                </Menu.Item>
            )}
            <Menu.Item key="logout" icon={<FiLogOut />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <div className='flex justify-between gap-4 px-8 pt-8 items-center bg-transparent'>
            <div>
                <Link to="/">
                    <img className='w-40 h-auto' src={fearlessVoiceLogo} alt="Fearless Voice" />
                </Link>
            </div>
            <div className='flex gap-6 items-center'>
                <Link to="/feed">
                    <button className='bg-[#222224] px-4 py-2 rounded-lg border-[1px] border-[#333335] text-white'>
                        View Reports
                    </button>
                </Link>
                
                <Link to="/">
                    <button className='text-white hover:text-[#fe570b] transition-colors'>
                        About Us
                    </button>
                </Link>
                
                {isLoggedIn ? (
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <button className='bg-[#fe570b] flex items-center gap-2 px-4 py-2 rounded-lg text-white'>
                            <FiUser /> {userName}
                        </button>
                    </Dropdown>
                ) : (
                    <Space>
                        {isConnected ? (
                            <Dropdown overlay={userMenu} placement="bottomRight">
                                <button className='bg-[#fe570b] flex items-center gap-2 px-4 py-2 rounded-lg text-white'>
                                    <FiUser /> {principal.substring(0, 8) + '...'}
                                </button>
                            </Dropdown>
                        ) : (
                            <Dropdown 
                                overlay={
                                    <Menu>
                                        <Menu.Item key="regular-login" icon={<FiUser />}>
                                            <Link to="/auth">User Login</Link>
                                        </Menu.Item>
                                        <Menu.Item key="admin-login" icon={<FiSettings />}>
                                            <Link to="/admin-auth">Admin Login</Link>
                                        </Menu.Item>
                                    </Menu>
                                } 
                                placement="bottomRight"
                            >
                                <button 
                                    className='bg-[#fe570b] flex items-center gap-2 px-4 py-2 rounded-lg text-white'
                                >
                                    <FiExternalLink /> {isConnecting ? 'Connecting...' : 'Login / Register'}
                                </button>
                            </Dropdown>
                        )}
                    </Space>
                )}
            </div>
        </div>
    );
};

export default Navbar;