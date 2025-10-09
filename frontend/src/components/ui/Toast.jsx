import React, { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Toast({message, code}) {
    const showToastMessage = () => {
        if(code >= 200 && code < 300) {
            toast.success(message);
        } else {
            toast.error(message);
        }
    }
    useEffect(() => {
        if(message && code) {
            showToastMessage();
        }
    }, [message, code]);
  return (
    <ToastContainer position='top-center' autoClose={3000}/>
  )
}

export default Toast