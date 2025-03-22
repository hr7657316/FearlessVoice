import React from 'react';
import { useContext, useEffect, useRef } from "react";
import Err404Img from "./../../../../assets/404.svg";
import { GlobalContext } from "../../../../context/global-context";
const Err404 = () => {
    const { Aside, PageTitle } = useContext(GlobalContext);
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update(false);
            PageTitle.set('Page Not Found');
        }
    }, []);
    return (
        <>
            <div className='flex justify-center items-center'>
                <img className='w-[50%] h-auto' src={Err404Img} />
            </div>
        </>
    )
}
export default Err404;