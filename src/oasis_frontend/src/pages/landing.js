import React from 'react';
import Navbar from './components/landing/navbar';
import bled from '../assets/Red&Black img.svg';
import arrow from '../../src/assets/arrow.svg';
import ulta from '../../src/assets/ulta-ulta.svg'
import { Link } from 'react-router-dom';

const FaqCard = (props) => {
    return (
        <>
            <div className='bg-[#161618] text-xl rounded-lg text-white px-4 py-8 mt-8 relative flex justify-center items-center'>
                <div className='flex flex-col justify-start items-start w-full mt-2 gap-2'>
                    <div className='text-[#fe570b] text-xl'>
                        {props.title}
                    </div>
                    <div className='text-sm'>
                        {props.answer}
                    </div>
                </div>
                <div className='absolute -top-5'>
                    <button className='bg-[#161618] w-16 h-16 rounded-full'>
                        <button className='bg-[#fe570b] w-10 h-10 rounded-full'>
                            <button className='text-white w-7 h-7 rounded-full'>
                                {props.count}
                            </button>
                        </button>
                    </button>
                </div>
            </div>
        </>
    )
}

const LandingPage = () => {
    var FaqCardCount = 0;
    const getFaqCardCount = () => {
        FaqCardCount += 1;
        return FaqCardCount
    }
    return (
        <div className={`bg-[#0e0e0e] overflow-hidden -z-10`}>
            <Navbar />
            
            <div id="hero">
                <div className='grid lg:grid-cols-2 lg:h-[80dvh]'>
                    <div className='flex order-2 lg:order-1 flex-col items-center justify-center gap-3 lg:gap-6 m-16'>
                        <div className=' text-[#fe570b] text-2xl md:text-2xl lg:text-5xl leading-6 font-bold '>
                            <span className='text-white'>Fearless Voice:</span> Corporate Integrity Platform
                        </div>
                        <div className='text-white flex flex-col gap-5 ml-1 lg:gap-10'>
                            <div className='text-base md:text-md lg:text-xl'>
                                Fearless Voice offers a secure, blockchain-powered whistleblowing solution 
                                for corporations committed to ethical business practices. Create a culture of 
                                transparency where employees can safely report misconduct, fraud, or violations 
                                of company policy without fear of retaliation.
                            </div>
                            <div className='flex items-center gap-8 lg:gap-5 '>
                                <Link to="/dashboard/abuse-form">
                                    <button className='text-white text-md lg:text-lg font-bold bg-[#fe570b] px-4 py-1 lg:px-6 lg:py-3 rounded-full'>
                                        Submit a Report
                                    </button>
                                </Link>
                                <a href='#faq'>
                                    <button className='bg-[#0d0101] text-white text-md lg:text-lg border-[1.5px] px-4 py-1 lg:px-7 lg:py-3 rounded-full'>
                                        Learn more
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='mt-7 lg:h-[80dvh] order-1 lg:order-2 flex items-center justify-center'>
                        <img className='w-[90%] h-auto drop-shadow-glow' src={bled} />
                    </div>
                </div>
            </div>
            <div id='faq'>
                <div className='bg-[#161618] text-white mx-36 my-20 py-8 rounded-lg grid grid-cols-3'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <div className='text-[#fe570b] text-6xl font-bold'>
                            98%
                        </div>
                        <div className='text-md font-semibold'>
                            Data Security
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <div className='text-[#fe570b] text-6xl font-bold'>
                            100+
                        </div>
                        <div className='text-md font-semibold'>
                            Corporate Clients
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <div className='text-[#fe570b] text-6xl font-bold'>
                            3500+
                        </div>
                        <div className='text-md font-semibold'>
                            Reports Processed
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex-col gap-3 text-4xl text-[#fe570b] my-10 flex items-center justify-center '>
                <span className='font-semibold'>Secure Whistleblowing Process</span>
                <span className='text-white text-4xl'>Our Enterprise-Grade Reporting Workflow</span>
            </div>
            <div className='grid grid-cols-8 items-center justify-center mx-8'>
                <div className='flex col-span-2'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <button className='bg-[#fe570b] text-xl text-white font-semibold rounded-full w-16 h-16'>
                            1
                        </button>
                        <div className='text-md text-white font-semibold'>
                            <div className='flex flex-col gap-2 items-center justify-center'>
                                Submit Anonymous Report
                                <span className='text-base font-normal mb-10 px-10'>
                                    Employee reports are encrypted and stored on blockchain technology, ensuring tamper-proof records and complete anonymity.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    <img className='h-auto w-24' src={arrow} />
                </div>
                <div className='flex col-span-2'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <button className='bg-[#fe570b] text-xl text-white font-semibold rounded-full w-16 h-16'>
                            2
                        </button>
                        <div className='text-md text-white font-semibold'>
                            <div className='flex flex-col gap-2 items-center justify-center'>
                                Secure Review by Management
                                <span className='text-base font-normal mb-10 px-14'>
                                    Authorized personnel receive and review reports through a secure dashboard while maintaining reporter anonymity.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    <img className='h-auto w-24' src={ulta} />
                </div>
                <div className='flex flex-col col-span-2 items-center justify-center gap-4'>
                    <button className='bg-[#fe570b] text-xl text-white font-semibold rounded-full w-16 h-16'>
                        3
                    </button>
                    <div className='text-md text-white font-semibold'>
                        <div className='flex flex-col gap-2 items-center justify-center'>
                            Investigation & Resolution
                            <span className='text-base font-normal mb-10 px-12'>
                                Reports are investigated according to company policy, with anonymous updates provided to whistleblowers through the platform.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='my-20'>
                <div className='text-5xl text-[#fe570b] flex flex-col gap-4 items-center justify-center my-6'>
                    FAQs
                    <div className='text-white text-2xl'>
                        Common questions about our corporate whistleblowing platform and how it can benefit your organization.
                    </div>
                </div>
                <div className='flex flex-col gap-8'>
                    <div className='grid grid-cols-3 gap-9 gap-y-20 mx-20 my-8'>
                        <FaqCard title="What types of corporate misconduct can be reported?"
                            answer="Fearless Voice supports reporting of all forms of corporate misconduct, including fraud, corruption, harassment, discrimination, safety violations, conflicts of interest, environmental violations, and other ethical breaches or legal non-compliance."
                            count={getFaqCardCount()} />
                        <FaqCard title="How does Fearless Voice ensure employee anonymity?"
                            answer="Our platform uses blockchain technology and advanced encryption to protect whistleblower identities. The system is designed so that even administrators cannot identify reporters unless they voluntarily disclose their identity."
                            count={getFaqCardCount()} />
                        <FaqCard title="Is the platform compliant with whistleblower protection laws?"
                            answer="Yes, Fearless Voice is designed to comply with major whistleblower protection regulations including Sarbanes-Oxley, Dodd-Frank, EU Whistleblower Protection Directive, and other relevant international standards."
                            count={getFaqCardCount()} />
                        <FaqCard title="How is data secured on the blockchain?"
                            answer="All data is encrypted and stored on a private blockchain, ensuring immutability and preventing tampering. This creates an unalterable audit trail while protecting sensitive information with enterprise-grade security protocols."
                            count={getFaqCardCount()} />
                        <FaqCard title="Can our company customize the reporting workflow?"
                            answer="Absolutely. Fearless Voice offers flexible customization options to align with your organization's specific policies, escalation procedures, and reporting structures. Our team works with you to implement a solution that fits your unique needs."
                            count={getFaqCardCount()} />
                        <FaqCard title="How can we demonstrate ROI from implementing Fearless Voice?"
                            answer="Companies using Fearless Voice typically see benefits in early fraud detection, reduced legal liabilities, improved corporate culture, enhanced ESG ratings, and strengthened regulatory compliance—all contributing to measurable ROI and risk mitigation."
                            count={getFaqCardCount()} />

                    </div>
                </div>
            </div>
            <div className="bg-[#161618] mt-24">
                <footer className="py-4 gap-2 mx-12 flex flex-col md:flex-row justify-between items-center px-4">
                    <div className="flex items-center flex-shrink-0 order-2 py">
                        <div>
                            <span className="text-[#a6aabb] text-sm font-medium pl-2">
                                <span className="text-[#5c5e6d] cursor-pointer"></span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 order-1 md:order-3">
                        <a href="#hero"><div className="cursor-pointer text-[#84889d] mr-4 text-sm ">
                            About
                        </div></a>
                        <Link to="/auth"><div className="cursor-pointer text-[#84889d] mr-4 text-sm">
                            Support
                        </div></Link>
                        <Link to="/dashboard/abuse-form"><div className="cursor-pointer text-[#84889d] mr-4 text-sm">
                            Contact Us
                        </div></Link>
                    </div>
                </footer>
            </div>
            <div className='lg:mt-10 flex flex-col-reverse lg:flex-row'>
                <div className='lg:w-[50%] flex justify-center lg:justify-start items-start'>
                    <img src={bled} alt="" className='w-[80%]' />
                </div>
                <div className='lg:w-[50%] flex flex-col items-center lg:items-start lg:pr-14'>
                    <div className='text-[44px] lg:text-[60px] text-white font-bold text-center lg:text-left lg:leading-tight'>
                        Ethical Workplace, <span className='text-[#fe570b]'>Fearless Reporting</span>
                    </div>
                    <div className='text-[20px] text-gray-500 mt-4 text-center lg:text-left'>
                        Empower your employees to speak up against misconduct while protecting them and your organization with our secure, blockchain-powered whistleblowing platform.
                    </div>
                    <Link to="/auth">
                        <button className='mt-10 bg-[#fe570b] text-white text-xl px-7 py-4 rounded-2xl'>Get Started</button>
                    </Link>
                </div>
            </div>

            {/* Corporate Benefits Section */}
            <div className='mt-20 mb-16 bg-[#161618] rounded-xl p-8 lg:p-12'>
                <div className='text-center mb-8'>
                    <h2 className='text-3xl lg:text-4xl font-bold text-white mb-3'>
                        <span className='text-[#fe570b]'>Business Benefits</span> of Ethical Reporting
                    </h2>
                    <p className='text-gray-400 text-lg max-w-3xl mx-auto'>
                        Beyond compliance, our platform delivers measurable value to businesses of all sizes.
                    </p>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12'>
                    <div className='text-white flex flex-col items-center p-6 border border-gray-800 rounded-xl'>
                        <div className='bg-[#fe570b] w-16 h-16 rounded-full flex items-center justify-center mb-4'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold mb-2'>Risk Mitigation</h3>
                        <p className='text-gray-400 text-center'>Early detection of issues before they become costly legal problems or reputational damage</p>
                    </div>
                    
                    <div className='text-white flex flex-col items-center p-6 border border-gray-800 rounded-xl'>
                        <div className='bg-[#fe570b] w-16 h-16 rounded-full flex items-center justify-center mb-4'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold mb-2'>Regulatory Compliance</h3>
                        <p className='text-gray-400 text-center'>Meet or exceed whistleblower program requirements across global jurisdictions</p>
                    </div>
                    
                    <div className='text-white flex flex-col items-center p-6 border border-gray-800 rounded-xl'>
                        <div className='bg-[#fe570b] w-16 h-16 rounded-full flex items-center justify-center mb-4'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold mb-2'>Culture Improvement</h3>
                        <p className='text-gray-400 text-center'>Cultivate transparency, accountability and employee engagement across the organization</p>
                    </div>
                </div>
                
                <div className='mt-12 text-center flex flex-col sm:flex-row gap-4 justify-center'>
                    <Link to="/auth">
                        <button className='bg-[#fe570b] text-white text-lg px-8 py-3 rounded-full'>Request Corporate Demo</button>
                    </Link>
                    <Link to="/">
                        <button className='bg-[#222224] border border-[#fe570b] text-white text-lg px-8 py-3 rounded-full hover:bg-[#fe570b] transition-colors'>Browse Anonymous Reports</button>
                    </Link>
                </div>
            </div>
            
            {/* Public Reports Section - NEW */}
            <div className='my-24 text-center'>
                <h2 className='text-4xl font-bold text-white mb-6'>
                    <span className='text-[#fe570b]'>Anonymous</span> Reports Feed
                </h2>
                <p className='text-gray-400 text-lg max-w-3xl mx-auto mb-8'>
                    Browse real whistleblower reports on our public feed. All personal identifiers have been removed to ensure anonymity and security.
                </p>
                <div className='flex justify-center'>
                    <Link to="/">
                        <button className='bg-[#fe570b] text-white text-xl px-10 py-4 rounded-lg flex items-center gap-3 hover:bg-[#e04e0a] transition-colors'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            View Public Reports
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;