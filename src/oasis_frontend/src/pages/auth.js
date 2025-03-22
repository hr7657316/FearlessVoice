import React, { useContext, useEffect, useState } from 'react';
import logo from '../assets/Logo.svg'
import fearlessVoiceLogo from '../assets/fearlessVoice.svg'
import auth1 from '../assets/Auth1.svg'
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Space, Spin, Typography } from 'antd';
import { useICWallet } from '../context/ic-wallet-context';
import { GlobalContext } from '../context/global-context';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const { Title, Text, Paragraph } = Typography;

const AuthPage = () => {
  const { message } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Use the ICWallet context
  const { 
    principal, 
    accountId, 
    isConnected, 
    isConnecting, 
    isPlugAvailable,
    browserCompatibility,
    connectPlug
  } = useICWallet();

  useEffect(() => {
    // Check if user is already authenticated
    if (isConnected && principal) {
      // Save auth data to localStorage for app-wide authentication
      const authData = {
        status: "logged-in",
        userInfo: {
          principal,
          accountId,
        }
      };
      localStorage.auth = JSON.stringify(authData);
      
      // Check if there's a redirect URL
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        // Clear the stored redirect URL
        sessionStorage.removeItem('redirectAfterLogin');
        // Navigate to the stored URL
        navigate(redirectUrl);
      } else {
        // Redirect to feed page (root) after delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    }
  }, [isConnected, principal, accountId, navigate]);

  const handleConnect = async () => {
    try {
      if (!browserCompatibility.compatible) {
        message.error(browserCompatibility.reason);
        return;
      }
      
      if (!isPlugAvailable) {
        message.error("Plug wallet not detected. Please install the Plug wallet extension.");
        window.open("https://plugwallet.ooo/", "_blank");
        return;
      }
      
      // Show connecting message
      message.loading("Connecting to Plug wallet...", 15);
      
      const connected = await connectPlug();
      
      if (connected) {
        message.success("Successfully connected to Plug wallet!");
      } else {
        message.error("Failed to connect to Plug wallet. Please try again.");
        setErrorMessage("Connection to Plug wallet failed. Please ensure you have the extension installed and try again.");
      }
    } catch (error) {
      console.error("Error connecting to Plug wallet:", error);
      message.error("Error connecting to Plug wallet");
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div className='grid grid-cols-12 h-screen'>
        <div className='bg-[#0e0e0e] col-span-5'>
          <div className='m-8'>
            <div>
              <Link to="/"><img className='w-24 h-auto mx-5' src={fearlessVoiceLogo} alt="Fearless Voice" /></Link>
              <div className='mt-12 mx-12'>
                <h1 className='text-3xl font-bold text-white'>Where Healing Begins <br /><span className='text-[#fe570b]'>Justice Prevails</span></h1>
              </div>
              <div className='mt-12 absolute bottom-10 w-[45%] right-0 left-0'>
                <img className='w-[90%] h-auto' src={auth1} />
              </div>
            </div>
          </div>
        </div>
        <div className='col-span-7 flex items-center justify-center'>
          <Card 
            bordered={false}
            className="w-[80%] bg-[#181818] shadow-lg"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="text-center mb-8">
              <Title level={2} className="text-[#fe570b]">
                Connect with Internet Computer
              </Title>
              <Paragraph className="text-white">
                Securely authenticate with your Plug wallet to access FearlessVoice
              </Paragraph>
            </div>
            
            {isConnected ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <FiCheckCircle className="text-green-500 text-4xl" />
                </div>
                <Title level={4} className="text-white">Successfully Connected!</Title>
                <Paragraph className="text-gray-400">
                  Principal ID: <Text copyable className="text-white">{principal?.substring(0, 10)}...{principal?.slice(-5)}</Text>
                </Paragraph>
                <Paragraph className="text-gray-400 mb-4">
                  Redirecting to reports feed...
                </Paragraph>
                <Spin />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {!browserCompatibility.compatible ? (
                  <Alert
                    message="Browser Compatibility Issue"
                    description={browserCompatibility.reason}
                    type="warning"
                    showIcon
                    icon={<FiInfo />}
                    className="w-full mb-4"
                  />
                ) : (
                  <Button 
                    type="primary"
                    onClick={handleConnect}
                    loading={isConnecting}
                    size="large"
                    style={{ 
                      backgroundColor: '#fe570b',
                      width: '100%',
                      height: '50px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '20px'
                    }}
                    disabled={!browserCompatibility.compatible}
                  >
                    {isPlugAvailable ? 'Connect with Plug Wallet' : 'Install Plug Wallet'}
                  </Button>
                )}
                
                {!isPlugAvailable && browserCompatibility.compatible && (
                  <div className="text-center w-full mb-4">
                    <Paragraph className="text-gray-400 mb-2">
                      Plug wallet not detected. Please install the extension first:
                    </Paragraph>
                    <Button
                      type="default" 
                      onClick={() => window.open("https://plugwallet.ooo/", "_blank")}
                      style={{
                        backgroundColor: "#222224",
                        color: "white",
                        borderColor: "#fe570b"
                      }}
                    >
                      Download Plug Wallet
                    </Button>
                  </div>
                )}
                
                {errorMessage && (
                  <Alert
                    message="Connection Error"
                    description={errorMessage}
                    type="error"
                    showIcon
                    icon={<FiAlertCircle />}
                    className="w-full mt-4"
                  />
                )}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Paragraph className="text-gray-400">
                New to Internet Computer? <a href="https://plugwallet.ooo/" target="_blank" rel="noopener noreferrer" className="text-[#fe570b]">Learn about Plug wallet</a>
              </Paragraph>
              <Paragraph className="text-gray-400">
                By connecting, you agree to FearlessVoice's <Link to="/" className="text-[#fe570b]">Terms of Service</Link>
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default AuthPage;