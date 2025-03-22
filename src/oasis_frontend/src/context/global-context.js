import useMessage from 'antd/es/message/useMessage';
import React from 'react';
import { createContext, useState } from "react";

const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [asideNavActive, setAsideNavActive] = useState(false);
    const [pageTitle, setPageTitle] = useState('Welcome');
    const [notificationsPanelVisibile, setNotificationsPanelVisibile] = useState(false);
    const [userDataStorage, setUserDataStorage] = useState(null);
    const [previewTokenCase, setPreviewTokenCase] = useState(false);
    const [message, messageProvider] = useMessage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileDrawer, putMobileDrawer] = useState(false);


    const Aside = {
        active: asideNavActive, update: setAsideNavActive
    };
    const PageTitle = {
        title: pageTitle, set: setPageTitle
    }
    const NotificationsPanel = {
        visibility: notificationsPanelVisibile, show: () => setNotificationsPanelVisibile(true), hide: () => setNotificationsPanelVisibile(false), toggle: () => setNotificationsPanelVisibile(!notificationsPanelVisibile)
    }
    const ReportedCases = {
        preview: previewTokenCase, update: setPreviewTokenCase
    }
    const Storage = {
        user: {
            set: setUserDataStorage,
            get: userDataStorage
        }
    }
    const Admin = {
        status: {
            set: setIsAdmin,
            get: isAdmin
        }
    }
    const drawer = {
        put: () => putMobileDrawer(true),
        reveal: mobileDrawer,
        remove: () => putMobileDrawer(false)
    }
    return (
        <GlobalContext.Provider value={{ Aside, PageTitle, NotificationsPanel, Storage, message, ReportedCases, Admin, drawer }}>
            {props.children}
            {messageProvider}
        </GlobalContext.Provider>
    )
}

export { GlobalContext, GlobalContextProvider };