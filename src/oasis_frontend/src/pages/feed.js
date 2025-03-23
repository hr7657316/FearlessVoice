import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/global-context';
import { oasis_backend } from '../../../declarations/oasis_backend';
import { Spin, message, Empty, Modal, Input, Radio, Form, Button } from 'antd';
import { FiEye, FiMessageCircle, FiClock, FiAlertCircle, FiThumbsUp, FiShare2, FiFlag, FiHome, FiFileText, FiFilePlus, FiLogOut, FiInfo, FiCopy, FiTwitter, FiFacebook, FiLinkedin, FiMail, FiShield } from 'react-icons/fi';
import Navbar from './components/landing/navbar';
import fearlessVoiceLogo from '../assets/fearlessVoice.svg';
import { useICWallet } from '../context/ic-wallet-context';
import Aside from './components/dashboard/aside';
import DashboardNavbar from './components/dashboard/navbar';

// Login Modal Component
const LoginPromptModal = ({ isVisible, onClose, actionType }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // Save current location to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', '/feed');
    navigate('/auth');
  };
  
  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      centered
      width="90%"
      maxWidth={400}
      className="login-prompt-modal"
    >
      <div className="text-center py-4 sm:py-6">
        <div className="bg-[#fe570b] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">Authentication Required</h3>
        <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
          {actionType === 'comment' 
            ? 'You need to log in to comment on this report.' 
            : actionType === 'like'
            ? 'You need to log in to like this report.'
            : actionType === 'share'
            ? 'You need to log in to share this report.'
            : actionType === 'report'
            ? 'You need to log in to flag this content.'
            : 'You need to log in to interact with this content.'}
        </p>
        <div className="flex justify-center gap-3 sm:gap-4">
          <button 
            onClick={onClose}
            className="px-3 sm:px-5 py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogin}
            className="px-3 sm:px-5 py-2 bg-[#fe570b] text-sm sm:text-base text-white rounded-lg hover:bg-[#e04e0a] transition-colors"
          >
            Log In Now
          </button>
        </div>
      </div>
    </Modal>
  );
};

// FeedItem component for displaying individual posts
const FeedItem = ({ report, index, onDataUpdate }) => {
  const { Storage } = useContext(GlobalContext);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginActionType, setLoginActionType] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(report.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(report.comments?.length || 0);
  const { principal, isConnected } = useICWallet();
  
  // State for share modal
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  // State for flag modal
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagDescription, setFlagDescription] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  
  // Generate a shareable link for the report
  const getShareableLink = () => {
    // In a real implementation, this would generate a unique link to the specific report
    // For now, we'll use the current URL with a report ID parameter
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?report=${report.id}`;
  };
  
  // Handle copy to clipboard
  const handleCopyLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopySuccess('Link copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        message.error('Failed to copy link');
      });
  };
  
  // Handle social media sharing
  const handleSocialShare = (platform) => {
    const link = encodeURIComponent(getShareableLink());
    const title = encodeURIComponent(`Anonymous Report: ${report.incidentTitle || 'Whistleblower Report'}`);
    const description = encodeURIComponent('Check out this anonymous whistleblower report on FearlessVoice.');
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${link}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${link}&title=${title}&summary=${description}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${description}%0A%0A${link}`;
        break;
      default:
        return;
    }
    
    // Open in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Close the modal
    setShareModalVisible(false);
  };
  
  // Handle flag submission
  const handleFlagSubmit = async () => {
    if (!flagReason) {
      message.error('Please select a reason for flagging this report');
      return;
    }
    
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) {
      message.error("Could not identify user. Please log in again.");
      return;
    }
    
    setIsSubmittingFlag(true);
    
    try {
      // Find the user who owns this report
      const reportOwnerId = report.reportOwnerId || null;
      
      if (!reportOwnerId) {
        // We need to search through all users to find who owns this report
        const allUsers = await oasis_backend.fetchAllUsers();
        let reportOwnerFound = false;
        
        for (const user of allUsers) {
          try {
            const userReports = JSON.parse(user.reportedAbuseCases || '[]');
            const matchingReport = userReports.find(r => r.id === report.id);
            
            if (matchingReport) {
              // Found the owner of this report
              await addFlagToReport(user.phone, report.id, userIdentifier, flagReason, flagDescription);
              reportOwnerFound = true;
              break;
            }
          } catch (error) {
            console.error("Error parsing reports:", error);
          }
        }
        
        if (!reportOwnerFound) {
          message.error("Could not find the report owner. Flag could not be added.");
        }
      } else {
        // We already know the report owner ID
        await addFlagToReport(reportOwnerId, report.id, userIdentifier, flagReason, flagDescription);
      }
      
      // Close the modal
      setFlagModalVisible(false);
      // Reset form fields
      setFlagReason('');
      setFlagDescription('');
      
      message.success('Report has been flagged. Thank you for helping to maintain content quality.');
      
    } catch (error) {
      console.error("Error flagging report:", error);
      message.error("Failed to flag report. Please try again.");
    } finally {
      setIsSubmittingFlag(false);
    }
  };
  
  // Helper function to add a flag to a report
  const addFlagToReport = async (ownerPhone, reportId, userIdentifier, reason, description) => {
    const userData = await oasis_backend.getUser(ownerPhone);
    
    if (userData && userData.length > 0) {
      const user = userData[0];
      let reportedAbuseCases = [];
      
      try {
        reportedAbuseCases = JSON.parse(user.reportedAbuseCases || '[]');
        const reportIndex = reportedAbuseCases.findIndex(r => r.id === reportId);
        
        if (reportIndex !== -1) {
          // Initialize flags array if it doesn't exist
          if (!reportedAbuseCases[reportIndex].flags) {
            reportedAbuseCases[reportIndex].flags = [];
          }
          
          // Add the flag
          reportedAbuseCases[reportIndex].flags.push({
            id: Date.now(),
            user: userIdentifier,
            reason: reason,
            description: description,
            timestamp: new Date().toISOString(),
            status: 'pending' // pending, reviewed, dismissed
          });
          
          // Update the report in the backend
          const result = await oasis_backend.updateReportedAbuseCases(
            ownerPhone,
            JSON.stringify(reportedAbuseCases)
          );
          
          // If we have an update callback, call it to refresh the feed
          if (onDataUpdate) {
            onDataUpdate();
          }
          
          console.log("Flag added:", result);
        }
      } catch (error) {
        console.error("Error adding flag:", error);
        throw error;
      }
    }
  };

  // Check if user has liked this post on initial load
  useEffect(() => {
    if (report.likes && Array.isArray(report.likes)) {
      const userIdentifier = getUserIdentifier();
      if (userIdentifier && report.likes.includes(userIdentifier)) {
        setHasLiked(true);
      }
    }
  }, [report]);
  
  // Helper to get current user's identifier (principal or phone)
  const getUserIdentifier = () => {
    if (principal && isConnected) {
      return principal;
    } else if (Storage.user.get && Storage.user.get.phone) {
      return Storage.user.get.phone;
    }
    return null;
  };
  
  // Improved authentication check - checks both context and localStorage
  const isLoggedIn = () => {
    // Check if user is in context
    if (!!Storage.user.get) {
      return true;
    }
    
    // Check if connected via Plug
    if (principal && isConnected) {
      return true;
    }
    
    // If not in context, check localStorage
    if (typeof localStorage !== 'undefined' && localStorage.auth) {
      try {
        const authData = JSON.parse(localStorage.auth);
        return authData.status === "logged-in";
      } catch (e) {
        console.error("Error parsing auth data", e);
        return false;
      }
    }
    
    return false;
  };
  
  // Handle actions that require authentication
  const handleAuthRequiredAction = (actionType) => {
    if (isLoggedIn()) {
      // User is logged in, they can perform the action
      if (actionType === 'comment') {
        setShowComments(true);
      } else if (actionType === 'like') {
        handleLikeAction();
      } else if (actionType === 'share') {
        setShareModalVisible(true);
      } else if (actionType === 'report') {
        setFlagModalVisible(true);
      } else {
        message.info(`${actionType} functionality will be implemented soon.`);
      }
    } else {
      // User is not logged in, show login prompt
      setLoginActionType(actionType);
      setLoginModalVisible(true);
    }
  };

  // Handle like/support action
  const handleLikeAction = async () => {
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) {
      message.error("Could not identify user. Please log in again.");
      return;
    }
    
    // Optimistic update for UI responsiveness
    setHasLiked(!hasLiked);
    setLikeCount(hasLiked ? likeCount - 1 : likeCount + 1);
    
    try {
      // Find the user who owns this report
      const reportOwnerId = report.reportOwnerId || null;
      if (!reportOwnerId) {
        // We need to search through all users to find who owns this report
        const allUsers = await oasis_backend.fetchAllUsers();
        let reportOwnerFound = false;
        
        for (const user of allUsers) {
          try {
            const userReports = JSON.parse(user.reportedAbuseCases || '[]');
            const matchingReport = userReports.find(r => r.id === report.id);
            
            if (matchingReport) {
              // Found the owner of this report
              await updateReportLikes(user.phone, report.id, userIdentifier, !hasLiked);
              reportOwnerFound = true;
              break;
            }
          } catch (error) {
            console.error("Error parsing reports:", error);
          }
        }
        
        if (!reportOwnerFound) {
          message.error("Could not find the report owner. Like action could not be completed.");
          // Revert optimistic update
          setHasLiked(hasLiked);
          setLikeCount(hasLiked ? likeCount : likeCount - 1);
        }
      } else {
        // We already know the report owner ID
        await updateReportLikes(reportOwnerId, report.id, userIdentifier, !hasLiked);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      message.error("Failed to update like status");
      // Revert optimistic update
      setHasLiked(hasLiked);
      setLikeCount(hasLiked ? likeCount : likeCount - 1);
    }
  };
  
  // Helper function to update likes for a report
  const updateReportLikes = async (ownerPhone, reportId, userIdentifier, isLiking) => {
    const userData = await oasis_backend.getUser(ownerPhone);
    
    if (userData && userData.length > 0) {
      const user = userData[0];
      let reportedAbuseCases = [];
      
      try {
        reportedAbuseCases = JSON.parse(user.reportedAbuseCases || '[]');
        const reportIndex = reportedAbuseCases.findIndex(r => r.id === reportId);
        
        if (reportIndex !== -1) {
          // Initialize likes array if it doesn't exist
          if (!reportedAbuseCases[reportIndex].likes) {
            reportedAbuseCases[reportIndex].likes = [];
          }
          
          if (isLiking) {
            // Add the user to likes if not already there
            if (!reportedAbuseCases[reportIndex].likes.includes(userIdentifier)) {
              reportedAbuseCases[reportIndex].likes.push(userIdentifier);
            }
          } else {
            // Remove the user from likes
            reportedAbuseCases[reportIndex].likes = reportedAbuseCases[reportIndex].likes.filter(
              id => id !== userIdentifier
            );
          }
          
          // Update the report in the backend
          const result = await oasis_backend.updateReportedAbuseCases(
            ownerPhone,
            JSON.stringify(reportedAbuseCases)
          );
          
          // If successful and we have an update callback, call it
          if (onDataUpdate) {
            onDataUpdate();
          }
          
          console.log("Like update result:", result);
        }
      } catch (error) {
        console.error("Error updating likes:", error);
        throw error;
      }
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      message.error("Please enter a comment");
      return;
    }
    
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) {
      message.error("Could not identify user. Please log in again.");
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      // Find the user who owns this report
      const reportOwnerId = report.reportOwnerId || null;
      if (!reportOwnerId) {
        // We need to search through all users to find who owns this report
        const allUsers = await oasis_backend.fetchAllUsers();
        let reportOwnerFound = false;
        
        for (const user of allUsers) {
          try {
            const userReports = JSON.parse(user.reportedAbuseCases || '[]');
            const matchingReport = userReports.find(r => r.id === report.id);
            
            if (matchingReport) {
              // Found the owner of this report
              await addCommentToReport(user.phone, report.id, userIdentifier, commentText);
              reportOwnerFound = true;
              break;
            }
          } catch (error) {
            console.error("Error parsing reports:", error);
          }
        }
        
        if (!reportOwnerFound) {
          message.error("Could not find the report owner. Comment could not be added.");
        }
      } else {
        // We already know the report owner ID
        await addCommentToReport(reportOwnerId, report.id, userIdentifier, commentText);
      }
      
      // Clear comment field
      setCommentText('');
      // Increment comment count
      setCommentCount(commentCount + 1);
      
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Helper function to add a comment to a report
  const addCommentToReport = async (ownerPhone, reportId, userIdentifier, comment) => {
    const userData = await oasis_backend.getUser(ownerPhone);
    
    if (userData && userData.length > 0) {
      const user = userData[0];
      let reportedAbuseCases = [];
      
      try {
        reportedAbuseCases = JSON.parse(user.reportedAbuseCases || '[]');
        const reportIndex = reportedAbuseCases.findIndex(r => r.id === reportId);
        
        if (reportIndex !== -1) {
          // Initialize comments array if it doesn't exist
          if (!reportedAbuseCases[reportIndex].comments) {
            reportedAbuseCases[reportIndex].comments = [];
          }
          
          // Add the new comment
          reportedAbuseCases[reportIndex].comments.push({
            id: Date.now(),
            user: userIdentifier,
            text: comment,
            timestamp: new Date().toISOString()
          });
          
          // Update the report in the backend
          const result = await oasis_backend.updateReportedAbuseCases(
            ownerPhone,
            JSON.stringify(reportedAbuseCases)
          );
          
          // If successful and we have an update callback, call it
          if (onDataUpdate) {
            onDataUpdate();
          }
          
          console.log("Comment added:", result);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    }
  };

  // Calculate time since posting (for "Posted X hours/days ago")
  const getTimeSince = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval > 1) return `${interval} years ago`;
      
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
      
      return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
    } catch (e) {
      return "Time unknown";
    }
  };

  // Manage expanded/collapsed state
  const [expanded, setExpanded] = useState(false);
  
  // State for image lightbox/modal
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Debug evidence data
  useEffect(() => {
    if (report && report.evidences) {
      console.log(`Report ${index} has ${report.evidences.length} evidence items:`, report.evidences);
    }
  }, [report]);
  
  // Truncate text if it's too long
  const truncateText = (text, maxLength = 250) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Open image in lightbox
  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setLightboxOpen(true);
  };
  
  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  // Render a user identifier (anonymized)
  const renderUserIdentifier = (userId) => {
    if (!userId) return "Anonymous";
    
    if (userId.startsWith("principal_")) {
      return `User ${userId.substring(10, 14)}...`;
    } else if (userId.length > 8) {
      return `User ${userId.substring(0, 4)}...`;
    }
    
    return `User ${userId}`;
  };

  return (
    <div className="bg-[#161618] rounded-lg p-3 sm:p-4 mb-4 text-white shadow-lg hover:shadow-xl transition-all duration-200">
      {/* Anonymous indicator - more responsive layout */}
      <div className="flex items-center mb-2 flex-wrap sm:flex-nowrap">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#fe570b] rounded-full flex items-center justify-center text-white font-bold">
          A
        </div>
        <div className="ml-2 flex-grow">
          <span className="text-gray-400 text-xs sm:text-sm">Anonymous Whistleblower</span>
          <div className="flex items-center text-xs text-gray-500">
            <FiClock className="mr-1" />
            <span>{getTimeSince(report.submittedOn)}</span>
          </div>
        </div>
        <div className={`ml-0 sm:ml-auto mt-2 sm:mt-0 ${getStatusColor(report.status)} text-white text-xs px-2 py-1 rounded-full`}>
          {report.status || 'Pending'}
        </div>
      </div>

      {/* Incident title and type */}
      <h3 className="text-lg sm:text-xl font-bold text-[#fe570b] mb-2">{report.incidentTitle || 'Anonymous Report'}</h3>
      <div className="mb-3 text-xs sm:text-sm bg-[#222224] inline-block px-2 py-1 rounded-md">
        {report.incidentType || 'Whistleblower Report'}
      </div>

      {/* Content */}
      <div className="mb-4 text-sm sm:text-base text-gray-300">
        {expanded ? report.description : truncateText(report.description)}
        {report.description && report.description.length > 250 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-[#fe570b] ml-2 text-xs sm:text-sm hover:underline"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Display uploaded images if available - improved responsive grid */}
      {report.evidences && report.evidences.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Uploaded Evidence:</h4>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {report.evidences.map((evidence, idx) => {
              // Handle both types of evidence formats that might be in the system
              // Some might be URLs, others might be objects with {filename, file, type}
              
              // Determine the image source
              let imageSrc = '';
              let filename = `Evidence ${idx + 1}`;
              
              if (typeof evidence === 'string') {
                // If evidence is a string URL
                imageSrc = evidence;
              } else if (evidence && evidence.file) {
                // If evidence is an object with a file property (base64)
                imageSrc = evidence.file;
                filename = evidence.filename || filename;
              } else if (evidence && evidence.URL) {
                // If evidence has a URL property
                imageSrc = evidence.URL;
                filename = evidence.filename || filename;
              }
              
              // Skip if no valid image source
              if (!imageSrc) return null;
              
              return (
                <div key={idx} className="relative group overflow-hidden rounded-md border border-gray-700 aspect-square flex items-center justify-center bg-[#222224]">
                  <img 
                    src={imageSrc} 
                    alt={filename}
                    className="w-full h-full object-contain max-h-full" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x400/161618/fe570b?text=Image+Unavailable';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => openLightbox(imageSrc)}
                      className="text-white bg-[#fe570b] px-3 py-1 rounded-md text-sm hover:bg-[#ff6a1e] transition-colors"
                    >
                      View Full Size
                    </button>
                    <a 
                      href={imageSrc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white text-xs hover:underline"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox/Modal for full-size image viewing */}
      {lightboxOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeLightbox}
        >
          <div 
            className="max-w-full w-[90%] sm:max-w-4xl max-h-[90vh] relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Full size evidence" 
              className="max-w-full max-h-[75vh] object-contain"
            />
            <div className="w-full flex justify-between items-center mt-3 p-2">
              <a 
                href={selectedImage} 
                download="evidence.jpg"
                className="text-white text-xs sm:text-sm bg-[#222224] hover:bg-[#333336] px-2 sm:px-3 py-1 rounded-md"
              >
                Download
              </a>
              <button 
                onClick={closeLightbox}
                className="text-white text-xs sm:text-sm bg-[#fe570b] px-3 sm:px-4 py-1 rounded-md hover:bg-[#ff6a1e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location & Organization - responsive text size */}
      {report.location && (
        <div className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
          <span className="font-semibold">Location:</span> {report.location}
        </div>
      )}

      {report.organization && (
        <div className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
          <span className="font-semibold">Organization:</span> {report.organization}
        </div>
      )}

      {/* Metadata and interactions - more responsive on small screens */}
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 border-t border-gray-700 pt-2 sm:pt-3 mt-2">
        <div className="flex items-center mr-3 sm:mr-4 mb-1 sm:mb-0">
          <FiEye className="mr-1" />
          <span>{Math.floor(Math.random() * 100) + 5} views</span>
        </div>
        <div 
          className="flex items-center mr-3 sm:mr-4 mb-1 sm:mb-0 cursor-pointer hover:text-[#fe570b] transition-colors"
          onClick={() => handleAuthRequiredAction('comment')}
        >
          <FiMessageCircle className="mr-1" />
          <span>{commentCount} comments</span>
        </div>
        {report.flags && report.flags.length > 0 && isLoggedIn() && (
          <div className="flex items-center mr-3 sm:mr-4 mb-1 sm:mb-0 text-yellow-500">
            <FiFlag className="mr-1" />
            <span>{report.flags.length} flags</span>
          </div>
        )}
        <div className="flex items-center ml-0 sm:ml-auto">
          <FiAlertCircle className="mr-1" />
          <span>Report #{index + 1}</span>
        </div>
      </div>

      {/* Interactive buttons - More responsive for small screens */}
      <div className="flex flex-wrap justify-between gap-1 mt-3 pt-3 border-t border-gray-700">
        <button 
          className={`flex items-center justify-center gap-1 sm:gap-2 ${hasLiked ? 'text-[#fe570b]' : 'text-gray-400'} hover:text-[#fe570b] transition-colors px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm`}
          onClick={() => handleAuthRequiredAction('like')}
        >
          <FiThumbsUp />
          <span>Support {likeCount > 0 ? `(${likeCount})` : ''}</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 hover:text-[#fe570b] transition-colors px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
          onClick={() => handleAuthRequiredAction('comment')}
        >
          <FiMessageCircle />
          <span>Comment</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 hover:text-[#fe570b] transition-colors px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
          onClick={() => handleAuthRequiredAction('share')}
        >
          <FiShare2 />
          <span>Share</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 hover:text-[#fe570b] transition-colors px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
          onClick={() => handleAuthRequiredAction('report')}
        >
          <FiFlag />
          <span>Flag</span>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="font-medium mb-3">Comments</h4>
          
          {/* Comment input */}
          {isLoggedIn() && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#222224] border border-gray-700 rounded-md p-2 text-white"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isSubmittingComment}
                className="bg-[#fe570b] text-white px-3 py-1 rounded-md disabled:opacity-50"
              >
                {isSubmittingComment ? "Sending..." : "Post"}
              </button>
            </div>
          )}
          
          {/* Display comments */}
          <div className="space-y-3">
            {report.comments && report.comments.length > 0 ? (
              report.comments.map((comment, idx) => (
                <div key={idx} className="bg-[#222224] p-3 rounded-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#fe570b]">{renderUserIdentifier(comment.user)}</span>
                    <span className="text-gray-500">{getTimeSince(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      <Modal
        title="Share This Report"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        centered
        width="90%"
        maxWidth={500}
        className="share-modal"
      >
        <div className="p-3 sm:p-4">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium mb-2">Copy Link</h3>
            <div className="flex gap-2">
              <Input 
                value={getShareableLink()} 
                readOnly 
                className="flex-1 text-xs sm:text-sm"
              />
              <Button 
                type="primary" 
                icon={<FiCopy />} 
                onClick={handleCopyLink}
                className="bg-[#fe570b] hover:bg-[#e04e0a] border-none"
              >
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
            {copySuccess && (
              <div className="text-green-500 mt-2 text-xs sm:text-sm">{copySuccess}</div>
            )}
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Share on Social Media</h3>
            <div className="flex justify-center gap-3 sm:gap-4">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="text-[#1DA1F2] p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on Twitter"
              >
                <FiTwitter size={20} />
              </button>
              <button
                onClick={() => handleSocialShare('facebook')}
                className="text-[#4267B2] p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on Facebook"
              >
                <FiFacebook size={20} />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="text-[#0077B5] p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <FiLinkedin size={20} />
              </button>
              <button
                onClick={() => handleSocialShare('email')}
                className="text-[#DB4437] p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share via Email"
              >
                <FiMail size={20} />
              </button>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Flag Modal */}
      <Modal
        title="Flag Inappropriate Content"
        open={flagModalVisible}
        onCancel={() => setFlagModalVisible(false)}
        footer={null}
        centered
        width="90%"
        maxWidth={500}
        className="flag-modal"
      >
        <div className="p-3 sm:p-4">
          <p className="mb-4 text-xs sm:text-sm text-gray-600">
            Help us maintain a safe and respectful community by reporting content that violates our community guidelines.
          </p>
          
          <Form layout="vertical">
            <Form.Item
              label="Reason for flagging"
              required
              validateStatus={!flagReason && isSubmittingFlag ? 'error' : ''}
              help={!flagReason && isSubmittingFlag ? 'Please select a reason' : ''}
            >
              <Radio.Group 
                onChange={(e) => setFlagReason(e.target.value)} 
                value={flagReason}
                className="text-xs sm:text-sm"
              >
                <div className="space-y-1 sm:space-y-2">
                  <Radio value="misinformation">Misinformation or false reporting</Radio>
                  <Radio value="harassment">Harassment or bullying</Radio>
                  <Radio value="inappropriate">Inappropriate or explicit content</Radio>
                  <Radio value="spam">Spam or solicitation</Radio>
                  <Radio value="other">Other (please specify)</Radio>
                </div>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              label="Additional details (optional)"
            >
              <Input.TextArea
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                placeholder="Please provide any additional information that will help us understand the issue."
                rows={3}
                className="text-xs sm:text-sm"
              />
            </Form.Item>
            
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setFlagModalVisible(false)}
                className="mr-2 text-xs sm:text-sm"
                size="middle"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleFlagSubmit}
                loading={isSubmittingFlag}
                className="bg-[#fe570b] hover:bg-[#e04e0a] border-none text-xs sm:text-sm"
                size="middle"
              >
                Submit Flag
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      
      {/* Login Modal */}
      <LoginPromptModal 
        isVisible={loginModalVisible} 
        onClose={() => setLoginModalVisible(false)}
        actionType={loginActionType}
      />
    </div>
  );
};

const FeedPage = () => {
  const { PageTitle, Storage } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [feedData, setFeedData] = useState([]);
  const isMounted = useRef(false);
  const navigate = useNavigate();
  const { principal, isConnected } = useICWallet();

  // Function to handle navigation and prevent unnecessary redirects
  const handleNavigation = (path, event) => {
    // If we're already on this path, prevent default behavior
    if (window.location.pathname === path) {
      event.preventDefault();
      return;
    }
    
    // Otherwise, navigate to the path
    navigate(path);
  };

  // Function to check if user is logged in
  const isLoggedIn = () => {
    // Check if user is in context
    if (!!Storage.user.get) {
      return true;
    }
    
    // Check if connected via Plug
    if (principal && isConnected) {
      return true;
    }
    
    // If not in context, check localStorage
    if (typeof localStorage !== 'undefined' && localStorage.auth) {
      try {
        const authData = JSON.parse(localStorage.auth);
        return authData.status === "logged-in";
      } catch (e) {
        console.error("Error parsing auth data", e);
        return false;
      }
    }
    
    return false;
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('auth');
    
    // Clear context
    if (Storage.user.get) {
      Storage.user.set(null);
    }
    
    // Reload the page
    window.location.reload();
  };

  // Function to fetch all reports from all users
  const fetchAllReports = async () => {
    try {
      const allUsers = await oasis_backend.fetchAllUsers();
      const allReports = [];
      
      // No need to track flag counts anymore since we removed the alert
      
      for (const user of allUsers) {
        try {
          // Parse reported abuse cases from each user
          const userReports = JSON.parse(user.reportedAbuseCases || '[]');
          
          // Debug: Log the raw report data
          console.log(`Raw reports for user ${user.phone}:`, userReports);
          
          // Add each report with anonymized data
          if (Array.isArray(userReports) && userReports.length > 0) {
            // Create anonymized copies of reports
            const anonymizedReports = userReports.map(report => {
              // Create a deep copy of the report
              const reportCopy = JSON.parse(JSON.stringify(report));
              
              // Add reportOwnerId for easy reference in like/comment functions
              reportCopy.reportOwnerId = user.phone;
              
              // No need to count flags anymore
              
              // Remove personally identifiable information
              delete reportCopy.complainantName;
              delete reportCopy.complainantContact;
              delete reportCopy.complainantEmail;
              delete reportCopy.userPhone;
              
              // Keep the evidences array if it exists
              return reportCopy;
            });
            
            allReports.push(...anonymizedReports);
          }
        } catch (error) {
          console.error(`Error processing reports for user ${user.phone}:`, error);
        }
      }
      
      // Sort by submission date (newest first)
      allReports.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0);
        const dateB = new Date(b.submissionDate || 0);
        return dateB - dateA;
      });
      
      // No need to set totalPendingFlags state
      
      console.log('All reports with evidence:', allReports);
      return allReports;
    } catch (error) {
      console.error("Error fetching reports:", error);
      message.error("Failed to load feed data");
      return [];
    }
  };

  // Add a refresh function
  const refreshFeed = () => {
    setLoading(true);
    message.loading("Refreshing reports...", 1.5);
    fetchAllReports().then(data => {
      setFeedData(data);
      setLoading(false);
      message.success("Reports refreshed successfully");
    }).catch(error => {
      console.error("Error refreshing feed:", error);
      setLoading(false);
      message.error("Failed to refresh reports");
    });
  };

  // Function to check if current user is an admin
  const isAdmin = () => {
    // Check if admin is marked in local storage
    if (typeof localStorage !== 'undefined' && localStorage.auth) {
      try {
        const authData = JSON.parse(localStorage.auth);
        return authData.userInfo && authData.userInfo.isAdmin === true;
      } catch (e) {
        console.error("Error parsing auth data", e);
      }
    }
    
    return false;
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      PageTitle.set('Anonymous Reports Feed');
      
      // Load authentication from localStorage if available
      if (typeof localStorage !== 'undefined' && localStorage.auth && !Storage.user.get) {
        try {
          const authData = JSON.parse(localStorage.auth);
          if (authData.status === "logged-in" && authData.userInfo) {
            // Update global context with user data
            Storage.user.set(authData.userInfo);
            console.log("Auth state loaded from localStorage");
          }
        } catch (e) {
          console.error("Error parsing auth data from localStorage", e);
        }
      }
      
      fetchAllReports().then(data => {
        setFeedData(data);
        setLoading(false);
      });
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-black min-h-screen overflow-hidden text-white">
      {/* Sidebar - hidden on mobile by default, controlled by state */}
      <div className="hidden md:block">
        <Aside />
      </div>
      
      {/* Mobile sidebar toggle button - only visible on small screens */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => {
            // This assumes drawer is controlled in GlobalContext or similar
            // You might need to implement this toggle functionality
            if (drawer && typeof drawer.toggle === 'function') {
              drawer.toggle();
            }
          }}
          className="bg-[#fe570b] text-white p-3 rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 h-screen overflow-y-auto w-full">
        {/* Add Dashboard Navbar for user profile */}
        {isLoggedIn() && <DashboardNavbar />}
        
        <div className="p-3 sm:p-4">
          {/* Top Login/Sign Up Button */}
          <div className="flex justify-end mb-4 sm:mb-8">
            {!isLoggedIn() && (
              <Link to="/auth">
                <button className="bg-[#333335] px-4 sm:px-6 py-1 sm:py-2 rounded-full text-white text-sm sm:text-base hover:bg-[#444446] transition-colors">
                  login/sign up
                </button>
              </Link>
            )}
          </div>
          
          {/* Main Content Header */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-10 text-center text-[#fe570b]">Anonymous Reports Feed</h1>
          
          {/* Feed Content */}
          <div className="w-full max-w-4xl mx-auto pb-8 sm:pb-12">
            {/* Refresh button */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={refreshFeed}
                className="flex items-center gap-1 sm:gap-2 bg-[#333335] hover:bg-[#444446] text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md transition-colors text-sm"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {loading ? "Refreshing..." : "Refresh Reports"}
              </button>
            </div>
            
            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <Spin size="large" tip="Loading anonymous reports..." />
              </div>
            ) : (
              <>
                {/* Empty state */}
                {feedData.length === 0 ? (
                  <Empty 
                    description={<span className="text-gray-400">No anonymous reports available yet</span>}
                    className="py-12 sm:py-20 bg-[#222224] rounded-2xl"
                  />
                ) : (
                  /* Feed items */
                  <div className="space-y-4 sm:space-y-6">
                    {feedData.map((report, index) => (
                      <FeedItem key={index} report={report} index={index} onDataUpdate={refreshFeed} />
                    ))}
                  </div>
                )}
                
                {/* Call to action - only shown for non-admin users, more responsive */}
                {!isAdmin() && (
                  <div className="mt-8 sm:mt-12 bg-[#222224] p-4 sm:p-6 rounded-2xl text-center">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Have something to report?</h2>
                    <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">Your identity will remain anonymous. Help create a safer environment for everyone.</p>
                    <Link to={isLoggedIn() ? "/dashboard/abuse-form" : "/auth"} className="bg-[#fe570b] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg inline-block text-sm sm:text-base hover:bg-[#e04e0a] transition-colors">
                      Submit Anonymous Report
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage; 