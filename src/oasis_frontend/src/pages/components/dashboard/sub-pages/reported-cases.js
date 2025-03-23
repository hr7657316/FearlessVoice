import React, { useState } from 'react';
import { Empty, Spin, Table, Tag, message, Button } from "antd";
import { useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../../../../context/global-context";
import PreLoader from '../../pre-loader';
import { oasis_backend } from '../../../../../../declarations/oasis_backend';
import BadgeComponent from '../../badge';
import { useICWallet } from '../../../../context/ic-wallet-context';
import { ReloadOutlined } from '@ant-design/icons';

const ReportedCases = () => {
    const { Aside, PageTitle, Storage, ReportedCases } = useContext(GlobalContext);
    const { principal, isConnected } = useICWallet();
    const isMounted = useRef(false);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [pageData, setPageData] = useState([]);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();
    
    const fetchData = () => {
        setIsContentLoading(true);
        return new Promise(async (resolve, reject) => {
            // Check if we have user data in context
            const hasContextUserData = Storage.user.get && (Storage.user.get.phone || Storage.user.get.principal);
            
            // Check if we have auth data in localStorage as fallback
            let localStorageUserData = null;
            if (!hasContextUserData && typeof localStorage !== 'undefined' && localStorage.auth) {
                try {
                    const authData = JSON.parse(localStorage.auth);
                    if (authData && authData.userInfo) {
                        localStorageUserData = authData.userInfo;
                        console.log("🔍 Using localStorage auth data as fallback:", localStorageUserData);
                        
                        // Optionally restore this to context
                        if (!Storage.user.get) {
                            Storage.user.set(localStorageUserData);
                            console.log("✅ Restored user data to context from localStorage");
                        }
                    }
                } catch (e) {
                    console.error("🚫 Error parsing localStorage auth data:", e);
                }
            }
            
            // Check for Wallet authentication first
            if (principal && isConnected) {
                console.log("Using ICP principal for authentication:", principal);
                
                try {
                    // Get all current users to find if this principal already has records
                    const allUsers = await oasis_backend.fetchAllUsers();
                    let userFound = false;
                    let userPhone = null;
                    let foundUserData = null;
                    
                    // Look for a matching principal
                    for (const user of allUsers) {
                        try {
                            // Check for principal in userData if available
                            if (user.userData) {
                                const userData = JSON.parse(user.userData);
                                if (userData.principal === principal) {
                                    userFound = true;
                                    userPhone = user.phone;
                                    foundUserData = user;
                                    break;
                                }
                            }
                        } catch (error) {
                            console.error("Error parsing user data:", error);
                        }
                    }
                    
                    // If user found, process their reports
                    if (userFound && foundUserData) {
                        console.log("🔍 Found existing user with principal:", foundUserData);
                        
                        // Safely parse the reportedAbuseCases
                        let reportedAbuseCases = [];
                        if (foundUserData.reportedAbuseCases) {
                            try {
                                reportedAbuseCases = JSON.parse(foundUserData.reportedAbuseCases);
                                console.log("✅ Successfully parsed reportedAbuseCases for principal user:", reportedAbuseCases);
                            } catch (e) {
                                console.error("🚫 Error parsing reportedAbuseCases:", e);
                                reportedAbuseCases = [];
                            }
                        }
                        
                        // Process the reports
                        const processedReports = JSON.parse(JSON.stringify(reportedAbuseCases));
                        
                        // Process each report
                        processedReports.forEach((report, idx) => {
                            console.log(`🔍 Processing report ${idx} for principal user:`, report);
                            // remove report.evidences from the object
                            if (report.evidences) delete report.evidences;
                        });
                        
                        console.log("✅ Final processed reports for principal user:", processedReports);
                        setPageData(processedReports);
                        resolve(true);
                        return;
                    } else {
                        // No reports found for this principal yet
                        console.log("No reports found for this principal user yet");
                        setPageData([]);
                        resolve(true);
                        return;
                    }
                } catch (error) {
                    console.error("Error fetching data for principal user:", error);
                    setPageData([]);  // Set empty data rather than failing
                    resolve(true);
                    return;
                }
            }
            
            // Legacy phone authentication - first try context
            const userPhone = hasContextUserData && Storage.user.get.phone 
                ? Storage.user.get.phone 
                : (localStorageUserData && localStorageUserData.phone 
                    ? localStorageUserData.phone 
                    : null);
                    
            if (!userPhone) {
                console.error("Phone not available in user data");
                
                // If we've retried less than 3 times and we're on a page refresh,
                // we might still be waiting for auth to initialize
                if (retryCount < 3) {
                    console.log(`🔄 Auth data not ready yet, retrying (${retryCount + 1}/3)...`);
                    setRetryCount(prevCount => prevCount + 1);
                    
                    // Retry after a short delay
                    setTimeout(() => fetchData().then(resolve).catch(reject), 1000);
                    return;
                }
                
                // If we've exhausted retries, return empty data
                setPageData([]);
                resolve(true);
                return;
            }
            
            console.log("🔍 Fetching data for phone:", userPhone);
            var resp = oasis_backend.getUser(userPhone);
            resp.then(data => {
                console.log("🔍 Raw user data from backend:", data);
                
                if (!data || data.length === 0) {
                    console.log("🚫 No data found for user");
                    setPageData([]);
                    resolve(true);
                    return;
                }
                
                data.forEach((value, index) => {
                    try {
                        console.log("🔍 Processing user data:", value);
                        
                        // Safely parse the reportedAbuseCases
                        let reportedAbuseCases = [];
                        if (value.reportedAbuseCases) {
                            try {
                                reportedAbuseCases = JSON.parse(value.reportedAbuseCases);
                                console.log("✅ Successfully parsed reportedAbuseCases:", reportedAbuseCases);
                            } catch (e) {
                                console.error("🚫 Error parsing reportedAbuseCases:", e);
                                console.log("🚫 Raw reportedAbuseCases:", value.reportedAbuseCases);
                                reportedAbuseCases = [];
                            }
                        } else {
                            console.log("🚫 No reportedAbuseCases found for user");
                        }
                        
                        // Ensure it's an array
                        if (!Array.isArray(reportedAbuseCases)) {
                            console.error("🚫 reportedAbuseCases is not an array, setting to empty array");
                            reportedAbuseCases = [];
                        }
                        
                        // Make a deep copy before modifying
                        const processedReports = JSON.parse(JSON.stringify(reportedAbuseCases));
                        
                        // Process each report
                        processedReports.forEach((report, idx) => {
                            console.log(`🔍 Processing report ${idx}:`, report);
                            // remove report.evidences from the object then update the array
                            if (report.evidences) delete report.evidences;
                        });
                        
                        console.log("✅ Final processed reports:", processedReports);
                        setPageData(processedReports);
                    resolve(true);
                    } catch (e) {
                        console.error("🚫 Error processing user data:", e);
                        reject(false);
                    }
                });
            }).catch(err => {
                console.error("🚫 Error fetching data:", err);
                reject(false);
            });
        });
    };

    // Function to handle refresh button click
    const handleRefresh = () => {
        message.loading("Refreshing data...", 1);
        fetchData().then(done => {
            message.destroy();
            if (done) {
                setIsContentLoading(false);
                message.success("Data refreshed successfully");
            } else {
                message.error("Failed to refresh data");
            }
        });
    };
    
    useEffect(() => {
        console.log("🔍 Page data updated:", pageData);
        console.table(pageData);
    }, [pageData])
    
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update("reported-cases");
            PageTitle.set('Reported Cases');
            fetchData().then(done => {
                if (done) {
                    setIsContentLoading(false);
                } else {
                    //retry another time
                    message.loading("Failed to load data. Retrying..", 30);
                    fetchData().then(done => {
                        message.destroy();
                        if (done) {
                            setIsContentLoading(false)
                        } else {
                            message.error("Failed to load data. Please try again later..", 5);
                        }
                    })
                }
            });
        }
    }, []);
    
    const dataSource = pageData.map((value, index) => {
        console.log(`🔍 Mapping report ${index} to table row:`, value);
        
            return {
                key: index,
            name: value.incidentTitle || "Anonymous Report",
            abuse_type: <div className='capitalize'>{value.incidentType || "Whistleblower Report"}</div>,
            location: value.organization || value.location || "Not specified",
            status: <BadgeComponent text={value.status || "pending"} />,
            date: <>{value.submittedOn ? new Date(value.submittedOn).toLocaleDateString() : "Not specified"}</>,
            action: <button onClick={() => handleView(value.id, Storage.user.get ? Storage.user.get.phone : null)} className="px-3 py-2 rounded-md text-white duration-200 ease-in-out hover:text-[#f1f1f1] hover:bg-[#fe580be4] bg-[#fe570b]">View</button>,
        };
    });

    const columns = [
        {
            title: 'Report Title',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <>Report Type</>,
            dataIndex: 'abuse_type',
            key: 'abuse_type',
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
            title: <>Submitted On</>,
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: <>Action</>,
            dataIndex: 'action',
            key: 'action',
        },
    ];

    const handleView = (id, phone) => {
        ReportedCases.update({
            id: id,
            phone: phone,
            adminView: true
        });
        navigate(`/dashboard/admin/view`);
    }

    return (
        <>
            {isContentLoading && <>
                <div className="flex items-center justify-center h-[70dvh]">
                    <PreLoader />
                </div>
            </>

                || <>
                    {pageData.length > 0 && <>
                        <div className="mb-4 flex justify-end">
                            <Button 
                                type="primary" 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefresh}
                                className="bg-[#fe570b] border-none hover:bg-[#e04e0a]"
                            >
                                Refresh Data
                            </Button>
                        </div>
                        <div className="overflow-x-auto relative">
                        <Table dataSource={dataSource} columns={columns} />
                        </div>
                    </>
                        || <div className="flex flex-col items-center justify-center h-[70dvh]">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<div className='text-gray-400'>No reported cases yet.</div>} />
                            <Button 
                                type="primary" 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefresh}
                                className="mt-4 bg-[#fe570b] border-none hover:bg-[#e04e0a]"
                            >
                                Refresh Data
                            </Button>
                        </div>}
                </>}
        </>
    )
}
export default ReportedCases;