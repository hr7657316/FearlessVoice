import React, { createContext, useState, useContext, useEffect } from 'react';
import { Principal } from '@dfinity/principal';

const ICWalletContext = createContext();

export const useICWallet = () => useContext(ICWalletContext);

// Utility function to check if browser is compatible with Plug wallet
export const checkBrowserCompatibility = () => {
  // Check if window.ic is available (indicates ICP-compatible browser)
  if (typeof window !== 'undefined') {
    // Check if we're on a modern browser that supports extensions
    const isModernBrowser = typeof window.chrome !== 'undefined' || 
                            typeof window.browser !== 'undefined' || 
                            typeof window.msBrowser !== 'undefined';

    if (!isModernBrowser) {
      return {
        compatible: false,
        reason: 'Your browser does not support browser extensions. Please use Chrome, Firefox, Brave, or Edge.'
      };
    }

    // Check if using a mobile browser (most mobile browsers don't support extensions)
    // More reliable mobile detection - checks both user agent AND touch points
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    
    // Only consider it a mobile browser if the user agent matches AND 
    // the window width is smaller than typical desktop sizes
    const isMobile = mobileUserAgent && window.innerWidth < 768 && hasTouchScreen;
    
    if (isMobile) {
      return {
        compatible: false,
        reason: 'Mobile browsers do not support Plug wallet. Please use a desktop browser.'
      };
    }

    return { compatible: true };
  }

  // If we can't determine (SSR environment), assume it's compatible
  return { compatible: true };
};

// Safe way to check if Plug is properly installed and functioning
const isPlugAvailable = () => {
  try {
    return !!(window?.ic?.plug && typeof window.ic.plug.requestConnect === 'function');
  } catch (error) {
    console.error("Error checking Plug availability:", error);
    return false;
  }
};

export const ICWalletProvider = ({ children }) => {
  const [principal, setPrincipal] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPlugAvailableState, setIsPlugAvailableState] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [browserCompatibility, setBrowserCompatibility] = useState({ compatible: true });

  useEffect(() => {
    // Check browser compatibility
    const compatibility = checkBrowserCompatibility();
    setBrowserCompatibility(compatibility);

    if (!compatibility.compatible) {
      console.warn(`Browser not compatible with Plug wallet: ${compatibility.reason}`);
      return;
    }

    // Safely check if Plug is available 
    const plugAvailable = isPlugAvailable();
    setIsPlugAvailableState(plugAvailable);
    
    if (plugAvailable) {
      // Safely check if already connected
      try {
        window.ic.plug.isConnected().then((connected) => {
          if (connected) {
            setIsConnected(true);
            getPlugPrincipal();
          }
        }).catch(err => {
          console.error("Error checking Plug connection:", err);
          setConnectionError("Failed to check Plug connection status");
        });
      } catch (err) {
        console.error("Error accessing Plug wallet methods:", err);
        setConnectionError("Cannot access Plug wallet. Please ensure the extension is properly installed.");
      }
    } else {
      console.log("Plug wallet not detected in browser or not properly initialized");
    }
  }, []);

  const getPlugPrincipal = async () => {
    if (!isPlugAvailable()) {
      return null;
    }
    
    try {
      const principal = await window.ic.plug.agent.getPrincipal();
      setPrincipal(principal.toString());
      
      // Get account ID
      const accountId = await window.ic.plug.accountId();
      setAccountId(accountId);
      
      return principal.toString();
    } catch (error) {
      console.error("Error getting Plug principal:", error);
      setConnectionError("Failed to get principal from Plug wallet");
      return null;
    }
  };

  const connectPlug = async () => {
    setConnectionError(null);
    
    if (!isPlugAvailable()) {
      // Redirect users to install Plug if not available
      window.open("https://plugwallet.ooo/", "_blank");
      setConnectionError("Plug wallet not detected. Please install the extension.");
      return false;
    }

    setIsConnecting(true);

    try {
      // Define the canisters your application will interact with
      const whitelist = [
        // Add your canister IDs here
        // Example: "rrkah-fqaaa-aaaaa-aaaaq-cai"
      ]; 
      
      // Set the correct host based on environment
      const host = window.location.host.includes('localhost') ? 
                  'http://localhost:4943' : 
                  'https://icp0.io';
      
      // Try to connect with a timeout to prevent hanging
      const connectionPromise = window.ic.plug.requestConnect({
        whitelist,
        host,
        timeout: 10000 // 10 seconds timeout
      });
      
      const result = await connectionPromise;

      if (result) {
        setIsConnected(true);
        await getPlugPrincipal();
      } else {
        setConnectionError("Connection request was rejected");
      }
      
      setIsConnecting(false);
      return result;
    } catch (error) {
      console.error("Error connecting to Plug wallet:", error);
      setConnectionError(error.message || "Failed to connect to Plug wallet");
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectPlug = async () => {
    if (!isPlugAvailable()) {
      setPrincipal(null);
      setAccountId(null);
      setIsConnected(false);
      return true;
    }
    
    try {
      await window.ic.plug.disconnect();
      setIsConnected(false);
      setPrincipal(null);
      setAccountId(null);
      return true;
    } catch (error) {
      console.error("Error disconnecting from Plug wallet:", error);
      setConnectionError("Failed to disconnect from Plug wallet");
      return false;
    }
  };

  return (
    <ICWalletContext.Provider
      value={{
        principal,
        accountId,
        isConnected,
        isConnecting,
        isPlugAvailable: isPlugAvailableState,
        connectionError,
        browserCompatibility,
        connectPlug,
        disconnectPlug,
        getPlugPrincipal
      }}
    >
      {children}
    </ICWalletContext.Provider>
  );
};

export default ICWalletContext; 