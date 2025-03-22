import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
const PreLoader = () => {
    return(
        <>
            <Spin indicator={<LoadingOutlined className='text-[#fff]' style={{fontSize: 30,}} />} />
        </>
    )
}

export default PreLoader;