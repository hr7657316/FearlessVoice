# FearlessVoice

<p align="center">
  <img src="temp_logo/logo.png" alt="FearlessVoice Logo" width="200"/>
</p>

<p align="center">
  A secure, blockchain-based reporting platform built on the Internet Computer Protocol.
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#wallet-setup">Wallet Setup</a> •
  <a href="#usage-guide">Usage Guide</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contact">Contact</a> •
  <a href="#license">License</a>
</p>

## Overview

FearlessVoice is a secure, blockchain-based reporting platform built on the Internet Computer Protocol that empowers users to safely document incidents, connect with support resources, and track case progress without compromising their privacy or security.

The platform addresses critical gaps in existing reporting systems:
- Traditional reporting methods often expose reporters to retaliation risks
- Centralized data storage is vulnerable to breaches and unauthorized access
- Complex procedures and privacy concerns discourage reporting
- Tracking case progress is typically opaque, causing additional distress
- Digital evidence is often easily compromised in traditional systems

By leveraging blockchain technology, FearlessVoice creates a tamper-proof environment where incident reports remain secure and immutable, while providing appropriate transparency to authorized stakeholders.

## Features

- **Secure Reporting Form**: Structured, user-friendly interface for reporting incidents
- **Case Tracking**: Real-time status updates for submitted reports
- **Admin Dashboard**: Authorized personnel can review and update case status
- **Blockchain Security**: All data is securely stored on the Internet Computer blockchain
- **Anonymous Reporting**: Options for users to maintain anonymity while still receiving support
- **Decentralized Authentication**: Secure login using Internet Computer's identity system
- **Evidence Repository**: Secure storage for documentation and supporting materials
- **Status Updates**: Automated notifications when case status changes
- **Responsive Design**: Optimized experience across desktop and mobile devices

## Tech Stack

### Frontend Development
- **Primary Framework:** React.js
- **Styling Framework:** TailwindCSS
- **Build Tool:** Webpack
- **Package Management:** npm

### Backend Services
- **Smart Contract Language:** Motoko
- **Blockchain Platform:** Internet Computer Protocol (ICP)
- **API Interface:** Candid interface description language

### Authentication & Security
- **Primary Authentication:** Internet Identity
- **Wallet Integration:** Plug wallet
- **Session Management:** Secure token-based authentication

### Application Architecture
- **State Management:** React Context API
- **Navigation:** React Router with custom navigation components
- **Data Flow:** Unidirectional state management pattern

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- DFX (DFINITY Canister SDK) - version 0.14.0 or higher
- Internet access for connecting to the Internet Computer network

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fearlessvoice.git
   cd fearlessvoice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local Internet Computer replica**
   ```bash
   dfx start --background
   ```

4. **Deploy canisters to the local replica**
   ```bash
   dfx deploy
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to http://localhost:8080

### Troubleshooting Common Setup Issues

- **Node Version Errors**: Ensure you're using Node.js v16 or higher
- **DFX Network Errors**: Check your internet connection and firewall settings
- **Canister Deployment Failures**: Make sure your local replica is running
- **Webpack Errors**: Clear the node_modules folder and reinstall dependencies

## Wallet Setup

FearlessVoice utilizes Internet Computer's authentication methods for secure access. Follow these steps to set up your wallet:

### Internet Identity Setup

1. **Create an Internet Identity**
   - Visit [https://identity.ic0.app/](https://identity.ic0.app/)
   - Click "Create New"
   - Follow the on-screen instructions to create your identity anchor
   - Record your recovery phrase and anchor number in a secure location

2. **Connect Your Internet Identity to FearlessVoice**
   - Navigate to the FearlessVoice login page
   - Select "Internet Identity" as your login method
   - Authenticate using your anchor number
   - Follow the prompts to authorize the application

### Plug Wallet Integration

1. **Install the Plug Wallet Extension**
   - Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/plug/cfbfdhimifdmdehjmkdobpcjfefblkjm) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/plug-wallet/)
   - Install the Plug wallet extension
   - Create a new wallet or import an existing one

2. **Connect Plug Wallet to FearlessVoice**
   - Navigate to the FearlessVoice login page
   - Select "Plug Wallet" as your login method
   - Approve the connection request in your Plug wallet
   - Your wallet is now connected for secure transactions

## Usage Guide

### For Regular Users

1. **Creating an Account**
   - Visit the FearlessVoice homepage
   - Click "Sign Up" or "Create Account"
   - Choose your preferred authentication method
   - Complete the registration process

2. **Submitting a Report**
   - Log in to your account
   - Navigate to "Create New Report" from the dashboard
   - Fill out the structured reporting form
   - Attach any supporting documentation or evidence
   - Submit your report to securely store it on the blockchain

3. **Tracking Report Status**
   - Access the "My Reports" section from your dashboard
   - View all your submitted reports and their current status
   - Click on any report to view detailed information
   - Receive notifications when your report status changes

4. **Communicating with Administrators**
   - Use the secure messaging feature within each report
   - Check for updates or requests for additional information
   - Maintain anonymity settings according to your preference

### For Administrators

1. **Accessing the Admin Panel**
   - Log in with your administrator credentials
   - Navigate to "/dashboard/admin" to access the admin panel
   - View the overview of all submitted reports

2. **Managing Reports**
   - Review incoming reports from the dashboard
   - Update report status (New, In Progress, Resolved, etc.)
   - Add internal notes and official responses
   - Assign reports to specific team members

3. **Report Analysis**
   - Access analytics and reporting features
   - View trends and patterns in reported incidents
   - Generate reports for compliance and auditing purposes

## Deployment

### ICP Mainnet Deployment

The application is deployed on the Internet Computer mainnet:

- **Frontend Canister:** https://qdbb6-taaaa-aaaan-qetfa-cai.icp0.io
- **Backend Canister:** https://qx3hc-myaaa-aaaan-qeq7a-cai.icp0.io

### Canister IDs

#### Development
- Frontend: `rrkah-fqaaa-aaaaa-aaaaq-cai`
- Backend: `ryjl3-tyaaa-aaaaa-aaaba-cai`

#### Production
- Frontend: `qdbb6-taaaa-aaaan-qetfa-cai`
- Backend: `qx3hc-myaaa-aaaan-qeq7a-cai`

### Deploying Your Own Instance

1. **Set up your identity**
   ```bash
   dfx identity new deployment-identity
   dfx identity use deployment-identity
   ```

2. **Configure canister settings**
   Edit the `dfx.json` file to customize your deployment settings.

3. **Deploy to the Internet Computer mainnet**
   ```bash
   dfx deploy --network ic
   ```

4. **Verify deployment**
   Check the output for your canister IDs and access URLs.

## Project Structure

```
fearlessvoice/
├── src/
│   ├── oasis_backend/                # Motoko backend code
│   │   ├── main.mo                   # Primary backend canister
│   │   ├── types.mo                  # Type definitions
│   │   └── utils/                    # Utility functions
│   └── oasis_frontend/               # React frontend code
│       ├── assets/                   # Static assets
│       │   ├── images/               # Image resources
│       │   └── styles/               # Global CSS files
│       └── src/                      # Application source code
│           ├── components/           # Reusable React components
│           │   ├── dashboard/        # Dashboard components
│           │   ├── forms/            # Form components
│           │   └── shared/           # Shared UI components
│           ├── pages/                # Application pages
│           │   ├── landing/          # Landing page components
│           │   ├── admin/            # Admin interface components
│           │   ├── user/             # User dashboard components
│           │   └── auth/             # Authentication pages
│           ├── utils/                # Frontend utilities
│           ├── services/             # API interaction services
│           ├── context/              # React context providers
│           └── index.jsx             # Entry point
├── .dfx/                            # Local canister state
├── dfx.json                         # DFX configuration
├── webpack.config.js                # Webpack configuration
├── package.json                     # NPM package configuration
├── tailwind.config.js               # TailwindCSS configuration
└── README.md                        # Project documentation
```

## Contact

### Project Correspondence

- **Project Name:** FearlessVoice
- **Contact Email:** contact@fearlessvoice.org
- **GitHub Repository:** [https://github.com/your-username/fearlessvoice](https://github.com/your-username/fearlessvoice)

### Deployment Information

- **ICP Mainnet:** [https://qdbb6-taaaa-aaaan-qetfa-cai.icp0.io](https://qdbb6-taaaa-aaaan-qetfa-cai.icp0.io)

### Bug Reporting

Please report bugs by opening an issue on GitHub or contacting us directly. Include:
- A clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Your browser and operating system

### How to Contribute

We welcome contributions from the community! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 