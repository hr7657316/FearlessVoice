import React, { useContext, useEffect, useState } from 'react';
import { BsFillBellFill } from 'react-icons/bs'
import { AiOutlineCaretDown, AiOutlineMenu } from 'react-icons/ai'
import { GlobalContext } from '../../../context/global-context';
import { Avatar, Drawer, Dropdown, Popover, Menu, Tooltip } from 'antd';
import Notifications from '../notifications';
import { Link, useNavigate } from 'react-router-dom';
import Aside from './aside';
import { useICWallet } from '../../../context/ic-wallet-context';
import { FiUser, FiLogOut, FiClipboard, FiSettings } from 'react-icons/fi';

const Navbar = () => {
    const { PageTitle, NotificationsPanel, Storage, drawer } = useContext(GlobalContext);
    const { principal, isConnected, disconnectPlug } = useICWallet();
    const [profilePic, setProfilePic] = useState('User');
    const [displayName, setDisplayName] = useState('...');
    const navigate = useNavigate();

    useEffect(() => {
        if (!Storage.user.get) {
            return; // Exit early if user data isn't available
        }
        
        // Use principal ID if available from ICP wallet
        if (principal) {
            setDisplayName(principal.substring(0, 8) + '...');
            setProfilePic(principal.substring(0, 1).toUpperCase());
        }
        // Fall back to phone if available
        else if (Storage.user.get.phone && Storage.user.get.phone !== null) {
            setDisplayName(Storage.user.get.phone);
        }
        // Otherwise use principal from storage if available
        else if (Storage.user.get.principal) {
            setDisplayName(Storage.user.get.principal.substring(0, 8) + '...');
            setProfilePic(Storage.user.get.principal.substring(0, 1).toUpperCase());
        }
        
        // Check for user data to display name
        if (Storage.user.get.userData) {
            //check if the count is greater than 0
            if (Object.keys(Storage.user.get.userData).length > 0) {
                if (Storage.user.get.userData.firstName) {
                    setProfilePic(Storage.user.get.userData.firstName.charAt(0).toUpperCase());
                    setDisplayName(Storage.user.get.userData.firstName + " " + Storage.user.get.userData.lastName);
                }
            }
        }
    }, [Storage.user.get, principal]);

    const handleLogout = async () => {
        // Disconnect from Plug wallet if connected
        if (isConnected) {
            await disconnectPlug();
        }
        
        // Clear localStorage
        localStorage.removeItem('auth');
        
        // Clear context
        if (Storage.user.get) {
            Storage.user.set(null);
        }
        
        // Redirect to landing page
        navigate('/');
    };
    
    const userMenu = (
        <Menu>
            <Menu.Item key="dashboard" icon={<FiUser />}>
                <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="abuse-form" icon={<FiSettings />}>
                <Link to="/dashboard/abuse-form">Submit Report</Link>
            </Menu.Item>
            <Menu.Item key="reported-cases" icon={<FiClipboard />}>
                <Link to="/dashboard/reported-cases">My Reports</Link>
            </Menu.Item>
            {principal && (
                <Menu.Item key="principal" icon={<FiClipboard />}>
                    <Tooltip title="Copy Principal ID">
                        <div onClick={() => {
                            navigator.clipboard.writeText(principal);
                        }}>
                            Principal ID: {principal.substring(0, 8)}...
                        </div>
                    </Tooltip>
                </Menu.Item>
            )}
            <Menu.Item key="logout" icon={<FiLogOut />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const notificationItems = [
        {
            label: <><Notifications /></>,
            onClick: () => console.log('Notification 1 Clicked'),
            key: '1',
        },
    ];
    
    return (
        <>
            <nav className='flex my-6 items-center mx-5 justify-between text-white'>
                <div className='flex gap-10'>
                    <div className='text-xl font-bold flex items-center gap-2'>
                        <div className='p-2 md:hidden rounded-md cursor-pointer' onClick={() => drawer.put()}>
                            <AiOutlineMenu />
                        </div>
                        <span className='text-[#fe570b]'>{PageTitle.title}</span>
                    </div>
                </div>
                <div className='flex mr-7 gap-3 items-center'>
                    <Popover
                        placement='bottomRight'
                        open={NotificationsPanel.visibility}
                        onClick={() => NotificationsPanel.toggle()}
                        content={<Notifications />}
                        trigger='click'
                    >
                        <div className='p-2 hover:bg-[#222222] rounded-full cursor-pointer duration-200 ease-in-out'>
                            <BsFillBellFill />
                        </div>
                    </Popover>
                    
                    <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                        <div className='flex items-center gap-3 cursor-pointer'>
                            <Avatar gap={4} className='cursor-pointer' style={{ backgroundColor: '#fe570b' }}>{profilePic}</Avatar>
                            <div className=''>{displayName}</div>
                            <AiOutlineCaretDown />
                        </div>
                    </Dropdown>
                </div>
            </nav>
            <Drawer 
                closable={true} 
                onClose={() => drawer.remove()} 
                width={280} 
                placement="left" 
                open={drawer.reveal}
                bodyStyle={{ padding: 0 }}
                style={{ backgroundColor: 'black' }}
            >
                <Aside />
            </Drawer>
        </>
    )
}

export default Navbar;