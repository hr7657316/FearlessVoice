import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContextProvider } from './context/global-context';
import { ICWalletProvider } from './context/ic-wallet-context';
import { ConfigProvider, theme } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <BrowserRouter>
        <GlobalContextProvider>
          <ICWalletProvider>
            <App />
          </ICWalletProvider>
        </GlobalContextProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
