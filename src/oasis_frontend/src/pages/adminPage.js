import React from 'react';
import Aside from './components/dashboard/aside';
import Navbar from './components/dashboard/navbar';

const AdminPage = (props) => {
    return (
        <div className="flex text-white">
            {/* Hidden on mobile, visible on md and up */}
            <div className="md:block hidden">
                <Aside />
            </div>
            <div className='md:ml-64 w-full'>
                <Navbar />
                <div className='mx-4'>
                    {props.children}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;