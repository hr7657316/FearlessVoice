import React from "react";
import { Tag } from "antd"
import { useEffect, useState } from "react";

const BadgeComponent = (props) => {
    const [type, setType] = useState(false);
    // type 'pending' = default, 'under-investigation' = info, 'resolved' = success
    useEffect(() => {
        if (props.text == 'pending') {
            setType('default');
        } else if (props.text == 'under investigation') {
            setType('orange');
        } else if (props.text == 'resolved') {
            setType('success');
        } else {
            setType('default');
        }
    }, [props.text])
    
    return (
        <>
            <Tag color={type} className="capitalize">{props.text}</Tag>
        </>
    )
}
export default BadgeComponent;