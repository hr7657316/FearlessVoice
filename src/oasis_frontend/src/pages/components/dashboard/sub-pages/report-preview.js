import React, { useState } from 'react';
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../../../context/global-context";
import { Modal, Result, Select, Table, Tabs, Tag } from "antd";
import { Link } from "react-router-dom";
import { AiOutlineArrowLeft } from 'react-icons/ai';
import PreLoader from '../../pre-loader';
import { oasis_backend } from '../../../../../../declarations/oasis_backend';
import { isAdmin } from '../../../../functions/fn';

const ReportPreview = (props) => {
    const view_key = props.view_key;
    const { Aside, PageTitle, ReportedCases, Storage, message } = useContext(GlobalContext);
    const isMounted = useRef(false);
    const [viewPage, setViewPage] = useState(false);
    const [pageData, setPageData] = useState([]);
    const [file, setFile] = useState(false);
    const [filePreviewModalOpen, setFilePreviewModalOpen] = useState(false);
    const [adminView, setAdminView] = useState(false);
    const [status, setStatus] = useState(false);
    var tableKey = 0;

    const uniqeKey = () => {
        tableKey += 1;
        return tableKey;
    }
    const StatusList = [
        {
            label: 'Pending',
            value: 'pending',
        },
        {
            label: 'Under Investigation',
            value: 'under investigation',
        },
        {
            label: 'Resolved',
            value: 'resolved',
        },
    ]

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aside.update("reported-cases");
            PageTitle.set(`Report Preview ${ReportedCases.preview ? ' - #' + ReportedCases.preview.id || 'Error' : ''}`);
            async function _init() {
                if (ReportedCases.preview) {
                    if (ReportedCases.preview.adminView == true) {
                        var admin = await isAdmin(Storage.user.get.phone);
                        if (!admin) {
                            setViewPage("not-allowed-as-admin");
                            return;
                        } else {
                            setAdminView(true);
                        }
                    }
                    var resp = oasis_backend.getUser(ReportedCases.preview.phone);
                    var obj = {};
                    resp.then(data => {
                        data.forEach((value, index) => {
                            delete value.token;
                            delete value.id;
                            obj['userData'] = JSON.parse(value.userData);
                            obj['userData']['phone'] = value.phone;
                            var reportedAbuseCases = JSON.parse(value.reportedAbuseCases); //array
                            reportedAbuseCases.forEach((value, index) => {
                                if (value.id == ReportedCases.preview.id) {
                                    // setFile(value.evidences);
                                    if (value.evidences.length > 0 || value.evidences != false) {
                                        value.evidences.forEach((fvalue, index) => {
                                            setFile(fvalue);
                                        });
                                    }
                                    delete value.evidences;
                                    obj['preview'] = value;
                                    setStatus(value.status);
                                    setPageData(obj);
                                }
                            });
                            setViewPage("content");
                        })
                    }).catch(err => {
                        console.error(err);
                        setViewPage("not-allowed");
                    })
                } else {
                    setViewPage("not-allowed");
                }
            }
            _init();
        }
    }, []);
    useEffect(() => {
        console.table(pageData);
        console.log(pageData);
        console.log(file);
    }, [pageData])
    const columns = [
        {
            title: 'Info',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Details',
            dataIndex: 'abuse_type',
            key: 'abuse_type',
        },
    ];
    const dataSource = [
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Abuser Name</div>,
            abuse_type: pageData.preview && pageData.preview.name || '-',

        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Type of Abuse</div>,
            abuse_type: pageData.preview && pageData.preview.type || '-',
        },
        {
            key: uniqeKey(),
            name: '',
            name: <div className="font-semibold">Location of Incident</div>,
            abuse_type: pageData.preview && pageData.preview.location || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Abuse Period</div>,
            abuse_type: pageData.preview && <>{pageData.preview.days} {pageData.preview.daysPeriod}</> || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Witness name (opt)</div>,
            abuse_type: pageData.preview && pageData.preview.witnessName || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Witness Ph. number (opt)</div>,
            abuse_type: pageData.preview && pageData.preview.witnessNo || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Description of Incident</div>,
            abuse_type: pageData.preview && pageData.preview.description || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Supporting Evidence (opt)</div>,
            abuse_type: file && <div className='underline underline-offset-2 cursor-pointer' onClick={() => setFilePreviewModalOpen(true)}>{file.filename}</div> || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Additional Info/comments (opt)</div>,
            abuse_type: pageData.preview && pageData.preview.addInfo || '-',
        },
    ];

    const dataSourceTwo = [
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Name</div>,
            abuse_type: pageData.userData && <>{pageData.userData.firstName} {pageData.userData.lastName}</> || '-',

        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Phone Number</div>,
            abuse_type: pageData.userData && pageData.userData.phone || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Address</div>,
            abuse_type: pageData.userData && pageData.userData.address || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">Aadhar Number</div>,
            abuse_type: pageData.userData && pageData.userData.aadharNo || '-',
        },
        {
            key: uniqeKey(),
            name: <div className="font-semibold">City & Pincode</div>,
            abuse_type: pageData.userData && <>{pageData.userData.city} - {pageData.userData.pincode}</> || '-',
        },
    ];
    const handleStatusUpdateFormSubmit = async (e) => {
        e.preventDefault();
        if (status) {
            message.loading('Updating status..', 30);
            var AllReports = await oasis_backend.getUser(pageData.userData.phone);
            AllReports.forEach(async (value, index) => {
                delete value.id;
                delete value.token;
                // delete value.userData;
                value.userData = JSON.parse(value.userData);
                value.reportedAbuseCases = JSON.parse(value.reportedAbuseCases);
                value.reportedAbuseCases.forEach((fvalue, index) => {
                    if (fvalue.id == ReportedCases.preview.id) {
                        fvalue.status = status;
                    }
                })
                value.reportedAbuseCases = JSON.stringify(value.reportedAbuseCases);
                var updateResp = oasis_backend.updateReportedAbuseCases(value.phone, value.reportedAbuseCases);
                updateResp.then(resp => {
                    message.destroy();
                    resp = JSON.parse(resp);
                    if (resp.status == 200) {
                        //update the owner about the status update
                        if(status != "pending"){
                            message.loading('Sending confirmation SMS..', 30);
                            var msg = `Hello ${value.userData.firstName},\n\nYour reported case with id #${ReportedCases.preview.id} has been updated to status '${status}'.\n\nRegards,\nTeam Fearless Voice.`;
                            msg = encodeURIComponent(msg);
                            var SMS_status = oasis_backend.sendSMS(value.phone, msg);
                            SMS_status.then(resp => {
                                message.destroy();
                                message.success('Status updated successfully');
                            })
                        } else {
                            message.success('Status updated successfully');
                        }
                    } else {
                        message.error('Failed to update status. Please try again later');
                    }
                })
            })
        }
    }
    return (
        <>
            {!viewPage && <div className="flex items-center justify-center h-[70dvh]">
                <PreLoader />
            </div>
                || viewPage == "content" && <div className="grid-cols-12 grid gap-3">
                    <div className="col-span-8">
                        <Table pagination={false} dataSource={dataSource} columns={columns} />

                    </div>
                    <div className="col-span-4">
                        <div className="flex flex-col gap-5 mt-4">
                            <div className="text-xl font-bold">Reporter's Info</div>
                            <Table pagination={false} dataSource={dataSourceTwo} columns={columns} />
                        </div>
                        {adminView && <div className='mt-8'>
                            <form className='flex gap-2' onSubmit={handleStatusUpdateFormSubmit}>
                                <Select
                                    name='newStatus'
                                    placeholder="Update New Status"
                                    options={StatusList}
                                    value={status || null}
                                    onChange={e => setStatus(e)}
                                    size='large'
                                    className='w-full'
                                />
                                <button className='bg-[#fe570b] text-white font-semibold rounded-md py-2 px-6'>UPDATE</button>
                            </form>
                        </div>}
                    </div>
                </div>
                || viewPage == "not-allowed" && <div className="flex items-center justify-center h-[70dvh]">
                    <Result
                        status="warning"
                        title="No Access Token Provided"
                        extra={<Link to='/dashboard/reported-cases'><button className='py-2 px-4 hover:border-[#fff] border-2 rounded-lg duration-300 ease-in-out text-[white]'><span className='flex items-center gap-2'><AiOutlineArrowLeft className='text-xl' /> Reported cases</span></button></Link>} />
                </div>

                || viewPage == "not-allowed-as-admin" && <div className="flex items-center justify-center h-[70dvh]">
                    <Result
                        status="warning"
                        title="You are not allowed to view this page"
                        extra={<Link to='/dashboard/reported-cases'><button className='py-2 px-4 hover:border-[#0f1629] border-2 rounded-lg duration-300 ease-in-out text-[#0f1629]'><span className='flex items-center gap-2'><AiOutlineArrowLeft className='text-xl' /> Reported cases</span></button></Link>} />
                </div>

            }
            <Modal title={'Evidence Preview'} footer={false} centered={true} width={800} open={filePreviewModalOpen} onCancel={() => setFilePreviewModalOpen(false)}>
                <div>
                    {file && <img src={file.file} className='w-full' /> || <div className='flex items-center justify-center h-[40dvh]'>
                        {/* no evidence found */}
                        <Result
                            status="info"
                            title="No Evidence Found"
                        />
                    </div>}
                </div>
            </Modal>
        </>
    )
}


export default ReportPreview;