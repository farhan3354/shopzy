import React, { useEffect, useState } from "react";

const Interview = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setInterval(() => {
            setCount(count+1);
            // console.log(count);
        }, 1000);
    }, []);

    return (
        <div>
            <h1>Interview</h1>
           <h1>
            {count}
            </h1> 
        </div>
    );
};
export default Interview;