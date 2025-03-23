import React, { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { GlobalContext } from "../../../../context/global-context";
import { Popover, Result, Table, Tabs, Tag, Tooltip, Button, Card, Form, Input, message, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { oasis_backend } from '../../../../../../declarations/oasis_backend';
import BadgeComponent from '../../badge';
import { isAdmin } from '../../../../functions/fn';
import PreLoader from '../../pre-loader';
import { AiOutlineReload } from 'react-icons/ai';
import { FiSettings, FiLock, FiShield, FiEdit } from 'react-icons/fi';
import { useICWallet } from '../../../../context/ic-wallet-context';

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: <>Abuse&nbsp;Type</>,
        dataIndex: 'abuse_type',
        key: 'type',
    },
    {
        title: <>Location</>,
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: <>Status</>,
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: <>Abuse Period</>,
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: <>Action</>,
        dataIndex: 'action',
        key: 'action',
    },
];


const filterArray = (array, key) => {
    return array.filter((value) => {
        // Handle status text variations for both authentication methods
        const status = value.status ? value.status.toLowerCase() : "";
        
        // Log status check for debugging
        console.log(`Checking status '${status}' against key '${key}'`);
        
        if (key === 'new' && (status === 'new' || status === 'pending')) {
            return true;
        } else if (key === 'processing' && (status === 'processing' || status === 'under investigation')) {
            return true;
        } else if (key === 'resolved' && status === 'resolved') {
            return true;
        }
        return false;
    });
}
const AdminHome = () => {
    const { Aside, PageTitle, ReportedCases, Storage } = useContext(GlobalContext);
    const { principal, isConnected } = useICWallet();
    const isMounted = useRef(false);
    const [defaultTab, setDefaultTab] = useState('pending');
    const [loadData, setLoadData] = useState([]);
    const navigate = useNavigate();
    const [viewPage, setViewPage] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm] = Form.useForm();
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update('admin');
            PageTitle.set('Admin | Home');
            loadContent();
            const Interval = setInterval(() => {
                if (window.location.pathname != "/dashboard/admin") {
                    clearInterval(Interval);
                } else {
                    loadContent();
                }
            }, 5000);
        }
    }, []);
    function loadContent() {
        // First check if the current user is an admin via localStorage
        isAdmin().then(adminStatus => {
            if (adminStatus) {
                setAdmin(true);
                setViewPage('content');
                
                console.log("🔍 Admin status verified, fetching all users and their reports");
                // Fetch all users and their reports
                var resp = oasis_backend.fetchAllUsers();
                resp.then(AllUsers => {
                    console.log("🔍 Received all users data:", AllUsers);
                    setLoadData([]);
                    
                    if (!AllUsers || AllUsers.length === 0) {
                        console.log("❌ No users found in the system");
                        return;
                    }
                    
                    let totalReportsProcessed = 0;
                    
                    AllUsers.forEach((User, index) => {
                        console.log(`🔍 Processing user ${index}:`, User);
                        
                        try {
                            // Keep a copy of the user's phone before deleting properties
                            const userPhone = User.phone;
                            
                        delete User.id;
                        delete User.token;
                        delete User.userData;
                            
                            // Safely parse the reported abuse cases
                            let reportedCases = [];
                            if (User.reportedAbuseCases) {
                                try {
                                    // Check if it's already an object or needs parsing
                                    if (typeof User.reportedAbuseCases === 'string') {
                                        reportedCases = JSON.parse(User.reportedAbuseCases);
                                    } else {
                                        reportedCases = User.reportedAbuseCases;
                                    }
                                    
                                    console.log(`✅ Successfully parsed reportedAbuseCases for user ${index}:`, reportedCases);
                                } catch (e) {
                                    console.error(`❌ Error parsing reportedAbuseCases for user ${index}:`, e);
                                    reportedCases = [];
                                }
                            }
                            
                            // Ensure it's an array
                            if (!Array.isArray(reportedCases)) {
                                console.error(`❌ reportedAbuseCases for user ${index} is not an array, setting to empty array`);
                                reportedCases = [];
                            }
                            
                            User.reportedAbuseCases = reportedCases;
                            
                        if (User.reportedAbuseCases.length > 0) {
                                console.log(`✅ User ${index} has ${User.reportedAbuseCases.length} reported cases`);
                                totalReportsProcessed += User.reportedAbuseCases.length;
                                
                                User.reportedAbuseCases.forEach((Case, caseIndex) => {
                                    console.log(`🔍 Processing case ${caseIndex} for user ${index}:`, Case);
                                    
                                    // Add the phone to the case object for reference
                                    Case.phone = userPhone;
                                    
                                    // Map fields to expected names if they don't match
                                    if (Case.incidentType && !Case.type) {
                                        Case.type = Case.incidentType;
                                    }
                                    
                                    if (Case.id === undefined) {
                                        console.warn(`⚠️ Case ${caseIndex} has no ID, this may cause issues with viewing`);
                                    }
                                    
                                setLoadData((prev) => {
                                    return [...prev, Case];
                                    });
                                });
                            } else {
                                console.log(`ℹ️ User ${index} has no reported cases`);
                            }
                        } catch (error) {
                            console.error(`❌ Error processing user ${index}:`, error);
                        }
                    });
                    
                    console.log(`✅ Total reports processed: ${totalReportsProcessed}`);
                }).catch(err => {
                    console.error("❌ Error fetching users:", err);
                    setViewPage('error');
                });
            } else {
                setAdmin(false);
                setViewPage('not-allowed');
            }
        }).catch(err => {
            console.error("❌ Error checking admin status:", err);
            setAdmin(false);
            setViewPage('not-allowed');
        });
    }

    useEffect(() => {
        console.log(loadData);
    }, [loadData]);

    const handleView = (id, phone) => {
        ReportedCases.update({
            id: id,
            phone: phone,
            adminView: true
        });
        navigate(`/dashboard/admin/view`);
    }

    const handlePasswordUpdate = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("New passwords don't match");
            return;
        }
        
        setIsUpdatingPassword(true);
        
        try {
            const result = await oasis_backend.updateAdminPassword(values.currentPassword, values.newPassword);
            const response = JSON.parse(result);
            
            if (response.status === 200) {
                message.success("Admin password updated successfully");
                passwordForm.resetFields();
                setShowPasswordForm(false);
            } else {
                message.error(response.error || "Failed to update password");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            message.error("Failed to update password: " + error.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <>
            {viewPage === 'content' ? (
                <div className='m-3'>
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                            <Button 
                                type="primary" 
                                icon={<AiOutlineReload />} 
                                onClick={loadContent}
                                style={{ backgroundColor: '#fe570b', borderColor: '#fe570b' }}
                            >
                                Refresh
                            </Button>
                        </div>
                        
                        {/* Admin Security Section */}
                        <Card 
                            title={
                                <span className="flex items-center">
                                    <FiShield className="mr-2 text-[#fe570b]" /> 
                                    Admin Security Settings
                                </span>
                            }
                            className="mb-5"
                            extra={
                                <Button 
                                    type="primary" 
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    icon={showPasswordForm ? <FiLock /> : <FiEdit />}
                                    style={{ backgroundColor: showPasswordForm ? '#666' : '#fe570b', borderColor: showPasswordForm ? '#666' : '#fe570b' }}
                                >
                                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                                </Button>
                            }
                        >
                            {showPasswordForm ? (
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordUpdate}
                                >
                                    <Form.Item
                                        name="currentPassword"
                                        label="Current Password"
                                        rules={[{ required: true, message: 'Please enter current password' }]}
                                    >
                                        <Input.Password placeholder="Enter current password" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="newPassword"
                                        label="New Password"
                                        rules={[
                                            { required: true, message: 'Please enter new password' },
                                            { min: 6, message: 'Password must be at least 6 characters' }
                                        ]}
                                    >
                                        <Input.Password placeholder="Enter new password" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        rules={[
                                            { required: true, message: 'Please confirm your password' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('The two passwords do not match'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password placeholder="Confirm new password" />
                                    </Form.Item>
                                    
                                    <Form.Item>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={isUpdatingPassword}
                                            style={{ backgroundColor: '#fe570b', borderColor: '#fe570b' }}
                                        >
                                            Update Password
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ) : (
                                <div className="text-gray-600">
                                    <p>Manage your admin account security. You can change your admin password here.</p>
                                    <p className="mt-2 text-sm text-gray-500">Last login: {new Date().toLocaleString()}</p>
                                </div>
                            )}
                        </Card>
                    
                        <Divider />

                        <Tabs defaultActiveKey={defaultTab}>
                            <Tabs.TabPane tab="New" key="pending">
                                <Table columns={columns} dataSource={filterArray(loadData, 'new').map((value, index) => {
                                    return {
                                        key: index,
                                        name: value.incidentTitle || value.name || "Anonymous Report",
                                        abuse_type: value.incidentType || value.type || "Whistleblower Report",
                                        location: value.organization || value.location || "Not specified",
                                        date: value.submittedOn ? new Date(value.submittedOn).toLocaleDateString() : value.date || "Not specified",
                                        status: <BadgeComponent text={value.status || "pending"} />,
                                        action: <button className='px-2 py-1 text-[#1677ff]' onClick={() => { handleView(value.id, value.phone) }}>View</button>
                                    }
                                })} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Under Investigation" key="processing">
                                <Table columns={columns} dataSource={filterArray(loadData, 'processing').map((value, index) => {
                                    return {
                                        key: index,
                                        name: value.incidentTitle || value.name || "Anonymous Report",
                                        abuse_type: value.incidentType || value.type || "Whistleblower Report",
                                        location: value.organization || value.location || "Not specified",
                                        date: value.submittedOn ? new Date(value.submittedOn).toLocaleDateString() : value.date || "Not specified",
                                        status: <BadgeComponent text={value.status || "pending"} />,
                                        action: <button className='px-2 py-1 text-[#1677ff]' onClick={() => { handleView(value.id, value.phone) }}>View</button>
                                    }
                                })} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Resolved" key="resolved">
                                <Table columns={columns} dataSource={filterArray(loadData, 'resolved').map((value, index) => {
                                    return {
                                        key: index,
                                        name: value.incidentTitle || value.name || "Anonymous Report",
                                        abuse_type: value.incidentType || value.type || "Whistleblower Report",
                                        location: value.organization || value.location || "Not specified",
                                        date: value.submittedOn ? new Date(value.submittedOn).toLocaleDateString() : value.date || "Not specified",
                                        status: <BadgeComponent text={value.status || "pending"} />,
                                        action: <button className='px-2 py-1 text-[#1677ff]' onClick={() => { handleView(value.id, value.phone) }}>View</button>
                                    }
                                })} />
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </div>
            ) : viewPage === 'not-allowed' ? (
                <Result
                    status="403"
                    title="403"
                    subTitle="Sorry, you are not authorized to access this page."
                    extra={<Link to="/"><Button type="primary">Back Home</Button></Link>}
                />
            ) : viewPage === 'error' ? (
                <Result
                    status="error"
                    title="Submission Failed"
                    subTitle="Please check and modify the following information before resubmitting."
                    extra={<Button type="primary" onClick={loadContent}>Try Again</Button>}
                />
            ) : (
                <div className='min-h-screen flex items-center justify-center'>
                    <PreLoader />
                </div>
            )}
        </>
    );
}

export default AdminHome;