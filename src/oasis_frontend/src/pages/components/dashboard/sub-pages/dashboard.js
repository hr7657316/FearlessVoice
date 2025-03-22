import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaUserEdit } from 'react-icons/fa'
import { GlobalContext } from '../../../../context/global-context';
import { validateAadhaar } from '../../../../functions/fn';
import { oasis_backend } from '../../../../../../declarations/oasis_backend';

const DashboardFormPage = () => {
    const { Aside, PageTitle, message, Storage } = useContext(GlobalContext);
    const isMounted = useRef(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [aadharNo, setAadharNo] = useState('');

    useEffect(() => {
        //check if user data is present in localstorage
        if (localStorage.auth) {
            var ldata = JSON.parse(localStorage.auth);
            if (ldata.userInfo.userData) {
                //check the data count
                if (Object.keys(ldata.userInfo.userData).length > 0) {
                    var userData = ldata.userInfo.userData;
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setEmailId(userData.emailId);
                    setAddress(userData.address);
                    setCity(userData.city);
                    setPincode(userData.pincode);
                    setAadharNo(userData.aadharNo);
                }
            }
        }
    }, [Storage.user.get])


    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update('dashboard');
            PageTitle.set('Dashboard');
        }
    }, []);

    const handleElement = async (e) => {
        e.preventDefault()
        //VALIDATE
        if (firstName === "" || lastName === "" || emailId === "" || address === "" || city === "" || pincode === "" || aadharNo === "") {
            message.error("Please fill all the details..", 5);
            return;
        } else {
            //validate aaadhar card number
            if (!validateAadhaar(aadharNo)) {
                message.error("Invalid Aadhar Card Number", 5);
                return;
            }
        }

        var userData = {
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            address: address,
            city: city,
            pincode: pincode,
            aadharNo: aadharNo
        }

        message.loading("Updating your details..", 120);
        var res = await oasis_backend.updateUserData(Storage.user.get.phone, JSON.stringify(userData));
        res = JSON.parse(res);
        message.destroy();
        if (res.status == 200) {
            //update localstorage and global context
            var ldata = JSON.parse(localStorage.auth);
            ldata.userInfo.userData = userData;
            localStorage.auth = JSON.stringify(ldata);
            Storage.user.set(ldata.userInfo);

            message.success("Your details has been updated successfully", 5);
        } else if (res.status == 400) {
            message.error(res.error, 5);
        }

    }
    return (
        <>
            <div className='ml-1 md:ml-10 text-white'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-2 border-b-[1.5px] border-[#fff] w-fit border-spacing-2'>
                        <FaUserEdit />
                        Personal Info
                    </div>
                </div>
                <form onSubmit={handleElement} className='my-10'>
                    <div className='flex flex-col gap-10'>
                        <div className='flex flex-col lg:flex-row items-center gap-10 lg:w-[80%]'>
                            <div className='flex flex-col gap-3 w-[100%]'>
                                <div className='font-semibold'>First Name</div>
                                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder='Enter your first name' name='firstName' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2' />
                            </div>
                            <div className='flex flex-col gap-3 w-[100%]'>
                                <div className='font-semibold'>Last Name</div>
                                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder='Enter your last name' name='lastName' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2' />
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 lg:w-[80%]'>
                            <div className='font-semibold'>Email ID</div>
                            <input type="email" value={emailId} onChange={e => setEmailId(e.target.value)} placeholder='Enter your email id' name='emailId' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2' />
                        </div>
                        <div className='flex flex-col gap-3 lg:w-[80%]'>
                            <div className='font-semibold'>Address</div>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder='Enter your home address' name='address' rows={3} className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2 resize-none' />
                        </div>
                        <div className='flex flex-col lg:flex-row items-center gap-10 lg:w-[80%]'>
                            <div className='flex flex-col gap-3 w-[100%]'>
                                <div className='font-semibold'>City</div>
                                <input value={city} onChange={e => setCity(e.target.value)} placeholder='Enter your city name' name='city' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2' />
                            </div>
                            <div className='flex flex-col gap-3 w-[100%]'>
                                <div className='font-semibold'>Pincode</div>
                                <input type='number' value={pincode} onChange={e => setPincode(e.target.value)} placeholder='Enter your pincode' name='pincode' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' />
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 lg:w-[80%]'>
                            <div className='font-semibold'>Aadhar Card Number</div>
                            <input value={aadharNo} onChange={e => setAadharNo(e.target.value)} placeholder='Enter your aadhar card number' name='aadharNo' className='border-2 bg-[#222222] border-transparent rounded-md focus:outline-none focus:border-[#333333] px-3 py-2' />
                        </div>
                    </div>
                    <button type='submit' className='bg-[#fe570b] text-white font-semibold rounded-md my-10 w-[100%] lg:w-[80%] py-2'>
                        UPDATE INFO
                    </button>
                </form>
            </div>
        </>
    )
}
export default DashboardFormPage;