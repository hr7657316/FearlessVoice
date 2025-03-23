import React, { useContext, useEffect, useRef, useState } from 'react';
import { DatePicker, Tooltip, Select, Checkbox, Empty, Button, Result, ConfigProvider, Tag } from 'antd';
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
    const [incidentType, setIncidentType] = useState([]);
    const [customTag, setCustomTag] = useState('');
    const [location, setLocation] = useState('');

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
            incidentType: incidentType.length > 0 ? incidentType.join(', ') : "Whistleblower Report",
            description: description,
            evidences: fileString,
            submittedOn: submittedOn,
            status: "pending",
            organization: "Corporate Entity", // Default value for corporate reports
            location: location || "Not specified" // Add location field
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
        console.log("🔍 Getting user data for submission with phone:", Storage.user.get.phone);
        var userData = oasis_backend.getUser(Storage.user.get.phone);
        message.loading("Processing report...", 120);
        userData.then(data => {
            console.log("🔍 Raw user data received:", data);
            
            if (!data || data.length === 0) {
                message.error("Could not retrieve user data. Please try again.");
                return;
            }
            
            data.forEach((value, index) => {
                console.log(`🔍 Processing user data ${index}:`, value);
                
                delete value.id;
                delete value.userData;
                delete value.phone;
                delete value.token;
                
                // Check if user has already reported an abuse case
                console.log("🔍 Report data to save:", fdata);
                
                if (value.reportedAbuseCases && value.reportedAbuseCases.length > 0) {
                    // User has reported abuse cases
                    try {
                        var reportedAbuseCases = JSON.parse(value.reportedAbuseCases);
                        console.log("✅ Existing reported cases:", reportedAbuseCases);
                        
                        // User has not reported this abuse case
                        data.id = Number(data.id);
                        reportedAbuseCases.push(fdata);
                        console.log("✅ Updated reported cases:", reportedAbuseCases);
                        
                        var resp = oasis_backend.updateReportedAbuseCases(Storage.user.get.phone, JSON.stringify(reportedAbuseCases));
                        resp.then(data => {
                            data = JSON.parse(data);
                            message.destroy();
                            console.log("✅ Backend response after update:", data);
                            if (data.status == 200) {
                                console.log("✅ Report submitted successfully");
                                updatePageSection('upload-success');
                            } else {
                                console.error("🚫 Failed to submit report:", data);
                                message.error('Failed to submit report!');
                            }
                        }).catch(err => {
                            console.error("🚫 Error updating reported cases:", err);
                            message.error("Failed to update report data. Please try again.");
                        });
                    } catch (err) {
                        console.error("🚫 Error parsing existing reported cases:", err);
                        message.error("Failed to process existing report data. Please try again.");
                    }
                } else {
                    // User has not reported any abuse cases
                    console.log("🔍 No existing reports, creating first one");
                    var reportedAbuseCases = [];
                    reportedAbuseCases.push(fdata);
                    
                    console.log("✅ New reported cases:", reportedAbuseCases);
                    var resp = oasis_backend.updateReportedAbuseCases(Storage.user.get.phone, JSON.stringify(reportedAbuseCases));
                    resp.then(data => {
                        data = JSON.parse(data);
                        console.log("✅ Backend response after update:", data);
                        if (data.status == 200) {
                            message.destroy();
                            console.log("✅ Report submitted successfully");
                            updatePageSection('upload-success');
                        } else {
                            console.error("🚫 Failed to submit report:", data);
                            message.error('Failed to submit report!');
                        }
                    }).catch(err => {
                        console.error("🚫 Error creating first report:", err);
                        message.error("Failed to save report data. Please try again.");
                    });
                }
            });
        }).catch(err => {
            message.destroy();
            console.error("🚫 Backend error:", err);
            message.error("Error connecting to the backend. Please try again.");
        });
    }

    const handleFileChange = (e) => {
        setFileString(false);
        //get multiple image files and convert them to base64 string and set it to state as object {filename: imgName, file: base64String, type: imgType}
        var files = e.target.files;
        var fileArr = [];
        
        // Keep maximum files at 3
        if (files.length > 3) {
            message.error('Maximum 3 files are allowed');
            //clear file input
            e.target.value = null;
            return;
        }

        // Track total size of all files
        let totalSize = 0;
        
        // Process each file
        const processFiles = async () => {
            for (var i = 0; i < files.length; i++) {
                //check if file is image
                if (!files[i].type.includes('image') || 
                    !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(files[i].type)) {
                    message.error('Only JPG, PNG and WEBP image files are allowed');
                    //clear file input
                    e.target.value = null;
                    return;
                }
                
                // Increased file size limit to 2MB per file
                if (files[i].size > 2000000) {
                    message.error('Each file size should be less than 2MB');
                    //clear file input
                    e.target.value = null;
                    return;
                }
                
                // Update total size
                totalSize += files[i].size;
            }
            
            // Increased total size limit to 3MB
            if (totalSize > 3000000) {
                message.error('Total file size should be less than 3MB');
                e.target.value = null;
                return;
            }
            
            // Process files after validation
            for (var i = 0; i < files.length; i++) {
                const file = files[i];
                await compressAndProcessImage(file, fileArr);
            }
        };
        
        // Enhanced compression function
        const compressAndProcessImage = (file, fileArr) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        // Create canvas for compression
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        
                        // More aggressive downsizing of large images
                        const maxDimension = 800; // Reduced from 1000
                        if (width > height && width > maxDimension) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else if (height > maxDimension) {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw and compress
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get compressed image as base64 string with lower quality
                        let compressedDataUrl;
                        // Determine appropriate quality based on original file size
                        let compressionQuality = 0.7; // Default
                        
                        if (file.size > 1000000) {
                            compressionQuality = 0.5; // More compression for larger files
                        }
                        
                        if (file.type === 'image/png') {
                            compressedDataUrl = canvas.toDataURL('image/jpeg', compressionQuality); // Convert PNG to JPEG for better compression
                        } else {
                            compressedDataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
                        }
                        
                        // Check compressed size and reduce further if needed
                        if (compressedDataUrl.length > 700000) { // ~700KB limit per file after compression
                            // Compress again with lower quality
                            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
                            
                            // If still too large, resize the canvas and try again
                            if (compressedDataUrl.length > 700000) {
                                const scaleFactor = 0.7;
                                canvas.width = width * scaleFactor;
                                canvas.height = height * scaleFactor;
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
                            }
                        }
                        
                        // Create file object with size tracking
                        const fileObj = {
                            filename: file.name,
                            file: compressedDataUrl,
                            type: 'image/jpeg', // Standardize to jpeg for consistency
                            originalSize: file.size,
                            compressedSize: Math.round(compressedDataUrl.length * 0.75) // Approximate byte size
                        };
                        
                        console.log(`Compressed ${file.name} from ${Math.round(file.size/1024)}KB to approximately ${Math.round(fileObj.compressedSize/1024)}KB`);
                        
                        // Add to array and update state
                        fileArr.push(fileObj);
                        setFileString([...fileArr]);
                        resolve();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        };
        
        // Start processing files
        processFiles().catch(error => {
            console.error("Error processing files:", error);
            message.error("Error processing files. Please try again.");
            e.target.value = null;
        });
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
                                    <div className='flex flex-wrap gap-2 mb-2'>
                                        {[
                                            { value: 'torture', label: '#torture' },
                                            { value: 'bullying', label: '#bullying' },
                                            { value: 'corporate office', label: '#corporate office' },
                                            { value: 'salary', label: '#salary' },
                                            { value: 'harassment', label: '#harassment' },
                                            { value: 'discrimination', label: '#discrimination' },
                                            { value: 'ethics', label: '#ethics' },
                                            { value: 'safety', label: '#safety' },
                                            { value: 'fraud', label: '#fraud' }
                                        ].map(tag => (
                                            <Tag 
                                                key={tag.value}
                                                className={`px-3 py-1 text-sm cursor-pointer ${incidentType.includes(tag.label) ? 'bg-[#fe570b] text-white' : 'bg-[#333333] hover:bg-[#444444]'}`}
                                                onClick={() => {
                                                    // Toggle tag selection
                                                    if(incidentType.includes(tag.label)) {
                                                        setIncidentType(incidentType.filter(t => t !== tag.label));
                                                    } else {
                                                        setIncidentType([...incidentType, tag.label]);
                                                    }
                                                }}
                                            >
                                                {tag.label}
                                            </Tag>
                                        ))}
                                    </div>
                                    <div className="flex">
                                        <input 
                                            type="text"
                                            placeholder="Or type your own custom tag"
                                            className='flex-1 border-2 rounded-l-md focus:outline-none bg-[#222222] border-transparent focus:border-[#333333] px-3 py-2'
                                            value={customTag}
                                            onChange={e => {
                                                setCustomTag(e.target.value);
                                            }}
                                        />
                                        <button 
                                            type="button"
                                            className='bg-[#333333] rounded-r-md px-3 hover:bg-[#444444]'
                                            onClick={() => {
                                                if(customTag.trim()) {
                                                    const newTag = customTag.startsWith('#') ? customTag : `#${customTag}`;
                                                    if(!incidentType.includes(newTag)) {
                                                        setIncidentType([...incidentType, newTag]);
                                                        setCustomTag('');
                                                    }
                                                }
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {incidentType.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-400 mb-1">Selected tags:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {incidentType.map((tag, index) => (
                                                    <Tag 
                                                        key={index}
                                                        className="bg-[#fe570b] text-white px-2 py-1"
                                                        closable
                                                        onClose={() => {
                                                            setIncidentType(incidentType.filter(t => t !== tag));
                                                        }}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className='flex flex-col gap-3 w-[80%]'>
                                    <div className='font-semibold'>Location (optional)</div>
                                    <input 
                                        value={location} 
                                        onChange={e => setLocation(e.target.value)} 
                                        name='location' 
                                        placeholder='Enter the location where the incident occurred' 
                                        className='border-2 rounded-md focus:outline-none bg-[#222222] border-transparent focus:border-[#333333] px-3 py-2' 
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
                                    <p className='text-[12px] text-[#fe570b]'>Supported file types: <span className='uppercase'>png, jpg, jpeg, webp</span> (Max 2MB per file, 3MB total)</p>
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
                            <Link to="/dashboard"><button type="submit" class="bg-[#fe570b] text-white font-semibold rounded-md py-2 px-4 uppercase">UPDATE PROFILE INFO</button></Link>
                        </Empty>
                    </div>
                </>
                || pageSection == "upload-success" && <>
                    <div className='h-[40dvh] flex items-center justify-center'>
                        <Result
                            status={'success'}
                            title={'Your Statement has been submitted successfully!'}
                            subTitle={
                                <div>
                                    <p>Your report has been securely submitted. Thank you for your courage in reporting this incident. We will review your information and take appropriate action.</p>
                                    <p className="mt-2 text-[#fe570b]">Note: You may need to click the "Refresh Data" button on the Reported Cases page to see your new submission.</p>
                                </div>
                            }
                            icon={<CheckCircleFilled className='text-[#0f1629]' />}
                            extra={[
                                <>
                                    <Link to='/dashboard/reported-cases'>
                                        <button className='px-4 bg-[#fe570b] text-white py-2 rounded-lg'>Go to Reported Cases</button>
                                    </Link>
                                    <Link to='/feed'><button className='py-2 ml-4 px-4 hover:border-[#fe570b] text-white border-2 rounded-lg duration-300 ease-in-out' key="buy">View Public Feed</button></Link>
                                </>]}
                        />
                    </div>
                </>
            }
        </>
    )
}

export default AbuseForm;