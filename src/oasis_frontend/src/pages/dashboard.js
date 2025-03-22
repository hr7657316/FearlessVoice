import React, { useContext, useEffect, useRef, useState } from 'react';
import AdminPage from './adminPage';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardFormPage from './components/dashboard/sub-pages/dashboard';
import AbuseForm from './components/dashboard/sub-pages/abuse-form';
import Err404 from './components/dashboard/sub-pages/Err-404';
import AdminHome from './components/dashboard/sub-pages/admin-home';
import ReportPreview from './components/dashboard/sub-pages/report-preview';
import ReportedCases from './components/dashboard/sub-pages/reported-cases';
import { GlobalContext } from '../context/global-context';
import { useICWallet } from '../context/ic-wallet-context';

// Welcome Message Component
const WelcomeMessage = () => {
    const { Storage } = useContext(GlobalContext);
    const { principal } = useICWallet();
    const [userName, setUserName] = useState('');
    const [showMessage, setShowMessage] = useState(true);
    
    useEffect(() => {
        // Check if user info is available from Plug wallet principal
        if (principal) {
            setUserName(principal.substring(0, 8) + '...');
        } else if (Storage.user.get) {
            if (Storage.user.get.principal) {
                setUserName(Storage.user.get.principal.substring(0, 8) + '...');
            } else if (Storage.user.get.phone && Storage.user.get.phone !== null) {
                setUserName(Storage.user.get.phone);
            } else {
                setUserName('User'); // Default fallback
            }
        } else if (typeof localStorage !== 'undefined' && localStorage.auth) {
            try {
                const authData = JSON.parse(localStorage.auth);
                if (authData.userInfo) {
                    if (authData.userInfo.principal) {
                        setUserName(authData.userInfo.principal.substring(0, 8) + '...');
                    } else if (authData.userInfo.phone && authData.userInfo.phone !== null) {
                        setUserName(authData.userInfo.phone);
                    } else {
                        setUserName('User'); // Default fallback
                    }
                } else {
                    setUserName('User'); // Default fallback
                }
            } catch (e) {
                console.error("Error getting user data", e);
                setUserName('User'); // Default fallback on error
            }
        } else {
            setUserName('User'); // Default fallback
        }
        
        // Auto-hide welcome message after 5 seconds
        const timer = setTimeout(() => {
            setShowMessage(false);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [Storage.user.get, principal]);
    
    if (!showMessage) return null;
    
    return (
        <div className="fixed top-20 right-5 z-50 bg-[#222224] text-white p-4 rounded-lg shadow-lg animate-fadeIn">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-[#fe570b] rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold">Welcome!</h3>
                    <p>You are logged in with <span className="text-[#fe570b]">ICP Principal: {userName}</span></p>
                </div>
                <button 
                    onClick={() => setShowMessage(false)}
                    className="ml-3 text-gray-400 hover:text-white"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [viewPage, setViewPage] = useState(false);
    const { page_id, view_key } = useParams();
    const navigate = useNavigate();
    const { Storage, Admin, PageTitle } = useContext(GlobalContext);
    const { isConnected, principal } = useICWallet();
    const isMounted = useRef(false);
    const [showWelcome, setShowWelcome] = useState(false);

    // Page title update
    useEffect(() => {
        if(PageTitle.title != false) {
            document.title = PageTitle.title + " | Fearless Voice";
        }
    }, [PageTitle.title]);

    const checkAuthentication = () => {
        // First check Plug wallet connection
        if (isConnected && principal) {
            return true;
        }
        
        // Then check local storage as fallback
        if (typeof localStorage !== 'undefined' && localStorage.auth) {
            try {
                const authData = JSON.parse(localStorage.auth);
                return authData && authData.status === "logged-in";
            } catch (e) {
                console.error("Error parsing auth data:", e);
                return false;
            }
        }
        
        return false;
    };

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            setShowWelcome(true);
            
            if (!checkAuthentication()) {
                navigate('/auth');
                return;
            }
            
            // If user is connected with Plug wallet
            if (isConnected && principal) {
                // Update storage with principal info if not already set
                if (!Storage.user.get) {
                    Storage.user.set({
                        principal: principal,
                    });
                }
                
                // Set admin status (can be based on ICP principal)
                // This would need to be updated to check admin status based on principal
                Admin.status.set(false);
            }
            // If using legacy auth (phone OTP)
            else if (localStorage.auth) {
                try {
                    const authData = JSON.parse(localStorage.auth);
                    
                    if (authData && authData.userInfo) {
                        if (!Storage.user.get) {
                            Storage.user.set(authData.userInfo);
                        }
                        
                        // Handle admin check based on legacy auth
                        // This would need to be updated for your specific admin verification method
                        Admin.status.set(false);
                    } else {
                        // Invalid auth data, redirect to auth page
                        navigate('/auth');
                    }
                } catch (e) {
                    console.error("Error setting user data:", e);
                    navigate('/auth');
                }
            }
        }
    }, [isConnected, principal]);

    useEffect(() => {
        if (page_id == "" || page_id == null) {
            setViewPage('dashboard');
        } else if (page_id == "abuse-form") {
            setViewPage('abuse-form')
        } else if (page_id == "admin" || page_id == "admin-home") {
            if (view_key == "" || view_key == null) {
                setViewPage('admin');
            } else {
                setViewPage('admin-view');
            }
        } else if (page_id == "reported-cases") {
            setViewPage('reported-cases');
        } else {
            setViewPage('404');
        }
    }, [page_id, view_key])
    
    return (
        <div>
            {/* Show welcome message when user logs in */}
            {showWelcome && <WelcomeMessage />}
            
            <AdminPage>
                {
                    viewPage == 'dashboard' && <DashboardFormPage />
                    || viewPage == 'abuse-form' && <AbuseForm />
                    || viewPage == '404' && <Err404 />
                    || viewPage == 'admin' && <AdminHome />
                    || viewPage == 'admin-view' && <ReportPreview view_key={view_key} />
                    || viewPage == 'reported-cases' && <ReportedCases />
                }
            </AdminPage>
        </div>
    );
}

export default Dashboard;