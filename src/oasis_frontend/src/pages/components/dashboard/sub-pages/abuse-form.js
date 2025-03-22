import React, { useContext, useEffect, useRef, useState } from 'react';
import { DatePicker, Tooltip, Select, Checkbox, Empty, Button, Result, ConfigProvider } from 'antd';
import { AiOutlineCheckCircle, AiOutlineInfoCircle } from 'react-icons/ai'
import { CheckCircleFilled } from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import { GlobalContext } from '../../../../context/global-context';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { oasis_backend } from '../../../../../../declarations/oasis_backend';
import { getRandomInt } from '../../../../functions/fn';
import { useICWallet } from '../../../../context/ic-wallet-context';
const { RangePicker } = DatePicker;
const AbuseForm = () => {
    const { Aside, PageTitle, message, Storage } = useContext(GlobalContext);
    const { principal, isConnected } = useICWallet();
    const isMounted = useRef(false);
    const [pageSection, updatePageSection] = useState(false);
    const [fileString, setFileString] = useState(false);
    const [description, setDescription] = useState('');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [policyAgreed, setPolicyAgreed] = useState(false);
    const [submitBtnDisabled, setSubmitBtnDisabled] = useState(true);
    const [incidentTitle, setIncidentTitle] = useState('');
    const [incidentType, setIncidentType] = useState('');

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update("abuse-form");
            PageTitle.set('Submit your Statement');
            // Always show the form, regardless of personal info
            updatePageSection("form");
        }
    }, []);
    
    useEffect(() => {
        if (termsAgreed && policyAgreed) {
            setSubmitBtnDisabled(false);
        } else {
            setSubmitBtnDisabled(true);
        }
    }, [termsAgreed, policyAgreed])
    
    useEffect(() => {
        if (fileString !== false) {
            console.log(fileString);
        }
    }, [fileString])
    
    const handleElement = async (e) => {
        e.preventDefault()
        if (submitBtnDisabled) {
            message.error('You must agree to the terms and policy to submit a new statement!');
            return;
        }
        
        // Check if user data is available
        if (!Storage.user.get) {
            message.error("User data not available. Please log in again.");
            return;
        }
        
        //VALIDATE
        if (description === "" || !description.trim()) {
            message.error("Please provide a detailed description of the incident.", 5);
            return;
        }
        
        if (fileString === false) {
            setFileString([]);
        }
        
        // Create current timestamp for submission date
        const submittedOn = new Date().toISOString();
        
        var fdata = {
            id: getRandomInt(111111, 999999),
            incidentTitle: incidentTitle || "Anonymous Report",
            incidentType: incidentType || "Whistleblower Report",
            description: description,
            evidences: fileString,
            submittedOn: submittedOn,
            status: "pending",
            organization: "Corporate Entity" // Default value for corporate reports
        }
        
        // Handle different authentication methods
        if (principal && isConnected) {
            // ICP Plug wallet flow - Actually save the report instead of simulating
            message.loading("Processing report using Plug wallet authentication...", 120);
            
            try {
                // Get all current users to find if this principal already has records
                const allUsers = await oasis_backend.fetchAllUsers();
                let userFound = false;
                let userPhone = null;
                
                // Look for a matching principal
                for (const user of allUsers) {
                    try {
                        // Check for principal in userData if available
                        if (user.userData) {
                            const userData = JSON.parse(user.userData);
                            if (userData.principal === principal) {
                                userFound = true;
                                userPhone = user.phone;
                                break;
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing user data:", error);
                    }
                }
                
                if (!userFound) {
                    // Create a virtual phone number for this principal
                    userPhone = `principal_${principal.substring(0, 8)}`;
                    
                    // Create user data structure with principal info
                    const userData = JSON.stringify({
                        principal: principal,
                        createdAt: new Date().toISOString()
                    });
                    
                    // Create a new user entry for this principal
                    await oasis_backend.addNewUser(
                        getRandomInt(100000, 999999), // random ID
                        userData, // userData with principal
                        JSON.stringify([]), // empty reportedAbuseCases
                        "0000", // default token
                        userPhone // virtual phone using principal
                    );
                    
                    console.log("Created new user record for Plug wallet user");
                }
                
                // Now save the report for this user
                if (userPhone) {
                    // Get existing reports for this user
                    const userData = await oasis_backend.getUser(userPhone);
                    
                    if (userData && userData.length > 0) {
                        const user = userData[0];
                        let reportedAbuseCases = [];
                        
                        // Parse existing reports if any
                        if (user.reportedAbuseCases && user.reportedAbuseCases.length > 0) {
                            try {
                                reportedAbuseCases = JSON.parse(user.reportedAbuseCases);
                            } catch (error) {
                                console.error("Error parsing existing reports:", error);
                                reportedAbuseCases = [];
                            }
                        }
                        
                        // Add the new report
                        reportedAbuseCases.push(fdata);
                        
                        // Save back to the backend
                        const updateResult = await oasis_backend.updateReportedAbuseCases(
                            userPhone, 
                            JSON.stringify(reportedAbuseCases)
                        );
                        
                        const result = JSON.parse(updateResult);
                        
                        message.destroy();
                        if (result.status == 200) {
                            console.log("Successfully saved report with Plug wallet authentication");
                            updatePageSection('upload-success');
                        } else {
                            message.error('Failed to submit report!');
                        }
                    } else {
                        message.error("Could not retrieve user data. Please try again.");
                    }
                } else {
                    message.error("Could not determine user identity. Please try again.");
                }
            } catch (error) {
                console.error("Error saving report with Plug wallet:", error);
                message.destroy();
                message.error("Error saving report. Please try again.");
            }
            
            return;
        }
        
        // Legacy flow with phone authentication
        if (!Storage.user.get.phone) {
            message.error("User phone not available. Please log in with a phone number or use the Plug wallet.");
            return;
        }
        
        //get user's previous abuse reports from backend
        var userData = oasis_backend.getUser(Storage.user.get.phone);
        message.loading("Processing report...", 120);
        userData.then(data => {
            if (!data || data.length === 0) {
                message.error("Could not retrieve user data. Please try again.");
                return;
            }
            
            data.forEach((value, index) => {
                delete value.id;
                delete value.userData;
                delete value.phone;
                delete value.token;
                //check if user has already reported an abuse case
                if (value.reportedAbuseCases.length > 0) {
                    //user has reported abuse cases
                    var reportedAbuseCases = JSON.parse(value.reportedAbuseCases);
                    
                    //user has not reported this abuse case
                    data.id = Number(data.id);
                    reportedAbuseCases.push(fdata);
                    console.table(reportedAbuseCases);
                    console.table(data);
                    var resp = oasis_backend.updateReportedAbuseCases(Storage.user.get.phone, JSON.stringify(reportedAbuseCases));
                    resp.then(data => {
                        data = JSON.parse(data);
                        message.destroy();
                        if (data.status == 200) {
                            updatePageSection('upload-success');
                        } else {
                            message.error('Failed to submit report!');
                        }
                    })
                } else {
                    //user has not reported any abuse cases
                    var reportedAbuseCases = [];
                    reportedAbuseCases.push(fdata);
                    var resp = oasis_backend.updateReportedAbuseCases(Storage.user.get.phone, JSON.stringify(reportedAbuseCases));
                    resp.then(data => {
                        data = JSON.parse(data);
                        if (data.status == 200) {
                            message.destroy();
                            updatePageSection('upload-success');
                        } else {
                            message.error('Failed to submit report!');
                        }
                    })
                }
            })
        }).catch(err => {
            message.destroy();
            message.error("Error connecting to the backend. Please try again.");
            console.error("Backend error:", err);
        });
    }

    const handleFileChange = (e) => {
        setFileString(false);
        //get  multiple image files and convert them to base64 string and set it to state as object {filename: imgName, file: base64String, type: imgType}
        var files = e.target.files;
        var fileArr = [];
        //max 5 files
        if (files.length > 5) {
            message.error('Maximum 5 files are allowed');
            //clear file input
            e.target.value = null;
            return;
        }

        for (var i = 0; i < files.length; i++) {
            //check if file is image
            if (!files[i].type.includes('image')) {
                message.error('Only image files are allowed');
                //clear file input
                e.target.value = null;
                return;
            }
            //check if file size is greater than 3mb
            if (files[i].size > 1000000) {
                message.error('Each file size should be less than 1mb');
                //clear file input
                e.target.value = null;
                return;
            }
            var file = files[i];
            var reader = new FileReader();
            reader.onload = (e) => {
                var fileObj = {
                    filename: file.name,
                    file: e.target.result,
                    type: file.type
                }
                fileArr.push(fileObj);
                setFileString(fileArr);
            }
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <>
            {pageSection == false && <>Loading...</>

                || pageSection == "form" && <>
                    <div className='ml-8'>
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-2 border-b-[1.5px] border-[#fff] w-fit border-spacing-2'>
                                <svg className="mt-1" width="28" height="13" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.3717 0C-6.98563 0 -2.11412 22 9.29322 22C11.5792 22 13.7316 20.8146 15.1037 18.7997L16.5779 16.6346C17.475 15.3175 19.2688 15.3175 20.166 16.6346L21.6401 18.7997C23.0117 20.8146 25.1642 22 27.4501 22C38.3275 22 44.1008 0 18.3717 0ZM10.5416 13.9998C8.18921 13.9998 6.65952 12.5297 5.95369 11.648C5.65405 11.2739 5.65405 10.7261 5.95369 10.3515C6.65952 9.46917 8.18864 7.99964 10.5416 7.99964C12.8946 7.99964 14.4237 9.46974 15.1295 10.3515C15.4292 10.7256 15.4292 11.2733 15.1295 11.648C14.4237 12.5303 12.894 13.9998 10.5416 13.9998ZM26.1249 13.9998C23.7725 13.9998 22.2429 12.5297 21.537 11.648C21.2374 11.2739 21.2374 10.7261 21.537 10.3515C22.2429 9.46917 23.772 7.99964 26.1249 7.99964C28.4779 7.99964 30.007 9.46974 30.7129 10.3515C31.0125 10.7256 31.0125 11.2733 30.7129 11.648C30.007 12.5303 28.4773 13.9998 26.1249 13.9998Z" fill="#fff" />
                                </svg>
                                Report Information
                            </div>
                        </div>
                        <form onSubmit={handleElement} className='my-10'>
                            <div className='flex flex-col gap-10'>
                                <div className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Report Title (optional)</div>
                                    <input 
                                        value={incidentTitle} 
                                        onChange={e => setIncidentTitle(e.target.value)} 
                                        name='incidentTitle' 
                                        placeholder='Enter a title for your report' 
                                        className='border-2 rounded-md focus:outline-none bg-[#222222] border-transparent focus:border-[#333333] px-3 py-2' 
                                    />
                                </div>
                                
                                <div className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Report Type (optional)</div>
                                    <Select
                                        name='incidentType'
                                        placeholder="Select report type"
                                        options={[
                                            { value: 'Fraud', label: 'Fraud' },
                                            { value: 'Corruption', label: 'Corruption' },
                                            { value: 'Harassment', label: 'Harassment' },
                                            { value: 'Discrimination', label: 'Discrimination' },
                                            { value: 'Safety Violation', label: 'Safety Violation' },
                                            { value: 'Environmental Issue', label: 'Environmental Issue' },
                                            { value: 'Ethics Violation', label: 'Ethics Violation' },
                                            { value: 'Other', label: 'Other' }
                                        ]}
                                        size='large'
                                        value={incidentType || null}
                                        onChange={e => setIncidentType(e)}
                                        className='w-full'
                                    />
                                </div>
                                
                                <div className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Detailed description of incident</div>
                                    <textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        name='description' 
                                        placeholder='Please provide a detailed description of the incident, including relevant dates, locations, individuals involved, and any other important details.' 
                                        rows={10} 
                                        className='border-2 rounded-md focus:outline-none bg-[#222222] border-transparent focus:border-[#333333] px-3 py-2 resize-none' 
                                    />
                                </div>
                                
                                <div className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Supporting Evidence</div>
                                    <input 
                                        onChange={handleFileChange} 
                                        name='evidences' 
                                        accept='image/png, image/jpeg, image/jpg, image/webp' 
                                        type='file' 
                                        multiple
                                        placeholder='Upload Evidence' 
                                        className='border-2 rounded-md focus:outline-none bg-[#222222] border-transparent focus:border-[#333333] px-3 py-2' 
                                    />
                                    <p className='text-[12px] text-[#fe570b]'>Supported file types: <span className='uppercase'>png, jpg, jpeg, webp</span> (Max 1 MB)</p>
                                </div>
                                
                                <div name='legals' className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Consent and Legal Disclaimer</div>
                                    <Checkbox onChange={e => setTermsAgreed(e.target.checked)}>I hereby declare that all information provided is true and accurate to the best of my knowledge.</Checkbox>
                                    <Checkbox onChange={e => setPolicyAgreed(e.target.checked)}>I understand that sharing fake information will result in legal repercussions, including but not limited to fines, penalties, or civil liabilities, depending on the jurisdiction and severity of the misinformation.</Checkbox>
                                </div>
                            </div>
                            <div className='w-[80%] flex justify-end'>
                                {submitBtnDisabled == true && <Tooltip title={'You must agree to the terms and policy to submit a new statement!'}><button disabled={submitBtnDisabled} type='submit' className='bg-[#fe570b] disabled:bg-[#fe570be9] disabled:cursor-not-allowed text-white  font-semibold rounded-md my-10 px-4 py-2'>
                                    Submit
                                </button></Tooltip>
                                    || !submitBtnDisabled &&
                                    <button disabled={submitBtnDisabled} type='submit' className='bg-[#fe570b] disabled:bg-[#fe570be9] disabled:cursor-not-allowed text-white  font-semibold rounded-md my-10 px-4 py-2'>
                                        Submit
                                    </button>
                                }
                            </div>
                        </form>
                    </div>
                </>

                || pageSection == "personalInfoRequired" && <>
                    <div className='h-[40dvh] flex items-center justify-center'>
                        <Empty
                            description={
                                <span>
                                    Please fill in your personal details before submitting your Statement...
                                </span>
                            }
                        >
                            <Link to="/dashboard"><button type="submit" class="bg-[#fe570b] text-white font-semibold rounded-md py-2 px-4 uppercase">UPDATE personal INFO</button></Link>
                        </Empty>
                    </div>
                </>
                || pageSection == "upload-success" && <>
                    <div className='h-[40dvh] flex items-center justify-center'>
                        <Result
                            status={'success'}
                            title={'Your Statement has been submitted successfully!'}
                            subTitle={'Your report has been securely submitted. Thank you for your courage in reporting this incident. We will review your information and take appropriate action.'}
                            icon={<CheckCircleFilled className='text-[#0f1629]' />}
                            extra={[
                                <>
                                    <Link to='/dashboard'>
                                        <button className='px-4 bg-[#fe570b] text-white py-2 rounded-lg'>Go to Dashboard</button>
                                    </Link>
                                    <Link to='/dashboard/reported-cases'><button className='py-2 ml-4 px-4 hover:border-[#fe570b] text-white border-2 rounded-lg duration-300 ease-in-out' key="buy">View your reported cases</button></Link>
                                </>]}
                        />
                    </div>
                </>
            }
        </>
    )
}

export default AbuseForm;