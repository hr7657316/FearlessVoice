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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

export const ICWalletProvider = ({ children }) => {
  const [principal, setPrincipal] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPlugAvailable, setIsPlugAvailable] = useState(false);
  const [browserCompatibility, setBrowserCompatibility] = useState({ compatible: true });

  useEffect(() => {
    // Check browser compatibility
    const compatibility = checkBrowserCompatibility();
    setBrowserCompatibility(compatibility);

    if (!compatibility.compatible) {
      console.warn(`Browser not compatible with Plug wallet: ${compatibility.reason}`);
      return;
    }

    // Check if Plug is available in the window object
    if (window.ic?.plug) {
      setIsPlugAvailable(true);
      
      // Check if already connected
      window.ic.plug.isConnected().then((connected) => {
        if (connected) {
          setIsConnected(true);
          getPlugPrincipal();
        }
      }).catch(err => {
        console.error("Error checking Plug connection:", err);
      });
    } else {
      console.log("Plug wallet not detected in browser");
    }
  }, []);

  const getPlugPrincipal = async () => {
    if (window.ic?.plug) {
      try {
        const principal = await window.ic.plug.agent.getPrincipal();
        setPrincipal(principal.toString());
        
        // Get account ID
        const accountId = await window.ic.plug.accountId();
        setAccountId(accountId);
        
        return principal.toString();
      } catch (error) {
        console.error("Error getting Plug principal:", error);
        return null;
      }
    }
    return null;
  };

  const connectPlug = async () => {
    if (!window.ic?.plug) {
      window.open("https://plugwallet.ooo/", "_blank");
      return false;
    }

    setIsConnecting(true);

    try {
      // Request connection
      const whitelist = []; // Add canister IDs that your app needs to interact with
      const host = process.env.DFX_NETWORK === 'ic' ? 'https://icp0.io' : 'http://localhost:4943';
      
      const result = await window.ic.plug.requestConnect({
        whitelist,
        host
      });

      if (result) {
        setIsConnected(true);
        await getPlugPrincipal();
      }
      
      setIsConnecting(false);
      return result;
    } catch (error) {
      console.error("Error connecting to Plug wallet:", error);
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectPlug = async () => {
    if (window.ic?.plug) {
      await window.ic.plug.disconnect();
      setIsConnected(false);
      setPrincipal(null);
      setAccountId(null);
      return true;
    }
    return false;
  };

  return (
    <ICWalletContext.Provider
      value={{
        principal,
        accountId,
        isConnected,
        isConnecting,
        isPlugAvailable,
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