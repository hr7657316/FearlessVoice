import React, { useContext, useState, useEffect } from 'react';
import logo from '../assets/Logo.svg'
import fearlessVoiceLogo from '../assets/fearlessVoice.svg'
import auth1 from '../assets/Auth1.svg'
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Space, Typography, Form, message as antMessage, Collapse, Tag, Tooltip } from 'antd';
import { GlobalContext } from '../context/global-context';
import { FiAlertCircle, FiLock, FiShield, FiInfo } from 'react-icons/fi';
import { oasis_backend } from '../../../declarations/oasis_backend';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const AdminAuthPage = () => {
  const { message } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  
  useEffect(() => {
    // Fetch admin phone number from backend for display
    const fetchAdminInfo = async () => {
      try {
        const phone = await oasis_backend.getAdmin();
        setAdminPhone(phone);
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    
    fetchAdminInfo();
  }, []);
  
  const handleAdminVerification = async () => {
    if (!password) {
      setErrorMessage("Please enter admin password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verify password against backend service
      const isPasswordValid = await oasis_backend.verifyAdminPassword(password);
      
      if (isPasswordValid) {
        // Create an admin auth object
        const authData = {
          status: "logged-in",
          userInfo: {
            isAdmin: true
          }
        };
        
        // Save to localStorage
        localStorage.auth = JSON.stringify(authData);
        
        // Show success message
        antMessage.success("Admin authentication successful!");
        
        // Navigate to admin dashboard
        navigate('/dashboard/admin');
      } else {
        setErrorMessage("Invalid admin credentials. Please try again.");
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      setErrorMessage(`Verification error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
                <h1 className='text-3xl font-bold text-white'>Admin Access <br /><span className='text-[#fe570b]'>Control Panel</span></h1>
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
                Admin Authentication
              </Title>
              <Paragraph className="text-white">
                Enter the admin password to access the control panel
              </Paragraph>
              
              {/* For Hackathon Judges */}
              <div className="mt-4 mb-4">
                <Collapse 
                  ghost
                  className="bg-[#222] rounded-md border border-[#333]"
                >
                  <Panel 
                    header={
                      <div className="flex items-center text-[#fe570b]">
                        <FiInfo className="mr-2" /> 
                        <span>For Hackathon Judges</span>
                        <Tag color="#fe570b" className="ml-2">Testing Credentials</Tag>
                      </div>
                    } 
                    key="1"
                  >
                    <div className="bg-[#111] p-3 rounded-md">
                      <div className="mb-2">
                        <strong className="text-[#fe570b]">Admin Password:</strong> 
                        <Tooltip title="Click to copy">
                          <code 
                            className="ml-2 bg-[#222] p-1 rounded cursor-pointer" 
                            onClick={() => {
                              navigator.clipboard.writeText("12345678");
                              antMessage.success("Password copied to clipboard!");
                            }}
                          >
                            12345678
                          </code>
                        </Tooltip>
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        <p>👆 Use these credentials to test the admin functionality of the platform.</p>
                        <p>Note: In a production environment, these credentials would not be exposed.</p>
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-center w-full mb-4">
                <Paragraph className="text-white mb-2">
                  <FiShield className="text-2xl inline-block mr-2 text-[#fe570b]" />
                  Enter admin password to gain access
                </Paragraph>
                
                <div className="mb-4">
                  <Input.Password
                    prefix={<FiLock className="site-form-item-icon" />}
                    placeholder="Admin Password"
                    className="mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="large"
                    style={{ width: '100%' }}
                    onPressEnter={handleAdminVerification}
                  />
                  
                  <Button 
                    type="primary"
                    onClick={handleAdminVerification}
                    loading={isSubmitting}
                    size="large"
                    style={{ 
                      backgroundColor: '#fe570b',
                      width: '100%',
                      height: '50px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '20px'
                    }}
                  >
                    Access Admin Panel
                  </Button>
                </div>
              </div>
              
              {errorMessage && (
                <Alert
                  message="Authentication Error"
                  description={errorMessage}
                  type="error"
                  showIcon
                  icon={<FiAlertCircle />}
                  className="w-full mt-2"
                />
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Paragraph className="text-gray-400">
                Not an admin? <Link to="/auth" className="text-[#fe570b]">Go to regular login</Link>
              </Paragraph>
              <Paragraph className="text-gray-400">
                By signing in, you agree to FearlessVoice's <Link to="/" className="text-[#fe570b]">Terms of Service</Link>
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminAuthPage; 