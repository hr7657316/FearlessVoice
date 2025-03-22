import React, { useContext, useState } from 'react';
import logo from '../assets/Logo.svg'
import fearlessVoiceLogo from '../assets/fearlessVoice.svg'
import auth1 from '../assets/Auth1.svg'
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Space, Typography, Form, message as antMessage } from 'antd';
import { GlobalContext } from '../context/global-context';
import { FiAlertCircle, FiLock, FiShield } from 'react-icons/fi';
import { oasis_backend } from '../../../declarations/oasis_backend';

const { Title, Text, Paragraph } = Typography;

const AdminAuthPage = () => {
  const { message } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  
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