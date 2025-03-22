<p align="center">
  <a href="https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/">
    <img src = "./src/oasis_frontend/src/assets/Logo.svg" width="1200" height="300">
  </a>
</p>

<h1 align="right"> BreakTheSilence : Empowering survivors, shattering silence, and fostering justice through an innovative online support platform. </h1>

                                              https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/

Break The Silence is an innovative online platform that provides a safe space for victims of abuse to raise their voices and seek justice.
Together, we are creating an oasis of support, where every voice matters,every survivor is empowered, and the cycle of this silence is shattered.

<p align="center">
  <a href="https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/">
    <img alt="Website" src="https://img.shields.io/badge/-website-blue">
  </a>
</p>

## 📎Deployment

<a href="https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/" target="_blank" rel="noopener noreferrer">Deployment Link </a>


## 😥The Problem

- Until now, there has been a lack of dedicated platforms in India that provide individuals with a secure and convenient way to report incidents of physical abuse online.
- The potential risks and vulnerabilities associated with data security when providing personal and complaint information raise concerns about protecting sensitive data from unauthorized access, breaches, and misuse.
- The proliferation of websites allowing users to provide personal information for generating reports prevents users from giving fake report.


## ✨The Solutions

- BreakTheSilence is an intuitive online platform designed to provide a secure and user-friendly experience for individuals reporting incidents of physical abuse. 
- The interface is accessible and easy to navigate, ensuring that survivors can report their experiences comfortably.
- BreakTheSilence allows users to report incidents of physical abuse, we safeguard their identities and protect their privacy. Thus encourages more survivors to come forward and seek the assistance they need without fear of retaliation.


## ⚒️ How BreakTheSilence Works?

BreakTheSilence streamlines the reporting process by providing a structured form that guides users through the necessary details of their incident. The platform ensures that critical information is captured accurately, enabling authorities to respond promptly and appropriately.
BreakTheSilence forwards the petition to the nearest police station after getting the required details from the users through a secured form handled by the admin. Once the case is registered police will directly be in contact with the user without interference of any third person. Admin will only have the access the update the status of the case.


## 🎯 Important Aspect!
BreakTheSilence use BLOCKCHAIN technology to store personal and complaint information which makes the data 100% secure , It ensures data integrity and prevents tampering, safeguarding sensitive details with encryption and access controls.
we incorporate a robust terms and conditions page. This page would require users to explicitly agree that the information they provide is true and accurate. By doing so, we can avoid the problem of fake reporting.



## ▶️ Installation

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with BreakTheSilence, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/quickstart/hello10mins)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove)
- [Motoko Programming Language Guide](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/)
- [Motoko Language Quick Reference](https://internetcomputer.org/docs/current/references/motoko-ref/)
- [JavaScript API Reference](https://erxue-5aaaa-aaaab-qaagq-cai.raw.icp0.io)

<br/>

- If you want to start working on your project right away, you might want to try the following commands:

```
bash
cd BreakTheSilence/
dfx help
dfx canister --help
```

 Running the project locally

- If you want to test your project locally, you can use the following commands:

```bash```

Starts the replica, running in the background

```dfx start --background```

- Deploys your canisters to the replica and generates your candid interface

```dfx deploy```


Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

- If you have made changes to your backend canister, you can generate a new candid interface with


```
bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

- If you are making frontend changes, you can start a development server with
```
bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

- Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
    
## 💻 Tech Stack

**Client:** React, TailwindCSS

**Backend:** Motoko, Python Flask (OTP Authentication)

![TechStack](https://cloud.webxspark.com/files/images/break-the-silence-techstack.png)

## ✌️ Our Team

## 📬 Project Correspondence

### Contact Information
- **Project Name**: FearlessVoice (BreakTheSilence)
- **Email**: fearlessvoice@example.com
- **Support**: support@fearlessvoice.org
- **GitHub Repository**: https://github.com/username/FearlessVoice

### Deployment Information
- **ICP Mainnet**: [https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/](https://wysb7-2qaaa-aaaag-qcf4a-cai.icp0.io/)
- **Canister IDs**:
  - Frontend: bd3sg-teaaa-aaaaa-qaaba-cai (Development)
  - Backend: bkyz2-fmaaa-aaaaa-qaaaq-cai (Development)
  - Frontend (Production): wysb7-2qaaa-aaaag-qcf4a-cai
  
### Bug Reporting
If you encounter any issues with the application, please report them through our issue tracker or send an email to bugs@fearlessvoice.org with the following information:
- A detailed description of the issue
- Steps to reproduce the problem
- Browser and device information
- Screenshots (if applicable)

### Project Updates
Follow us on social media for the latest updates and announcements:
- Twitter: [@FearlessVoice](https://twitter.com/fearlessvoice)
- Instagram: [@FearlessVoice_official](https://instagram.com/fearlessvoice_official)
- LinkedIn: [FearlessVoice](https://linkedin.com/company/fearlessvoice)

### How to Contribute
We welcome contributions from developers, designers, and content creators. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide to get started.
