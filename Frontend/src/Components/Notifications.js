import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import axios from 'axios';

const Notifications = () => {
  const [data, setData] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [showRejectedAlert, setShowRejectedAlert] = useState(false); 
  const [rejectedNotifications, setRejectedNotifications] = useState(
    JSON.parse(localStorage.getItem("rejectedNotifications")) || []
  );
   
  const columns = [
    {
      name: "sender",
      label: "SENDER",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "message",
      label: "MESSAGE",
      options: {
        filter: false,
        sort: false,
      }
    },
    {
        name: "Request",
        label: "Request",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const notification = data[tableMeta.rowIndex];
            if (!notification) return null;
  
            if (!notification.accepted &&!rejectedNotifications.includes(notification.id)) {
              return (
                <>
                  <button onClick={() => handleConfirm(notification)}>Confirm</button>
                  <button onClick={() => handleReject(notification)}>Reject</button>
                  {/*... */}
                </>
              );
            } else if (notification.accepted) {
              return <span>Request Accepted</span>;
            } else {
              return <span>Request Rejected</span>;
            }
          },
        },
      },
  ];
  
  const options = {
    filterType: 'checkbox',
  };

  useEffect(() => {
    fetchData();
  }, []); 

  const fetchData = () => {
    const username = localStorage.getItem("username");
    const passwordAuth = localStorage.getItem("password");

    axios.get("http://127.0.0.1:8000/api/chatapp/manage-interest/", {
      auth: {
        username: username,
        password: passwordAuth
      }
    })
    .then((response) => {
      const userData = response.data.filter(notification => notification.receiver === username);
      setData(userData);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  };

  const handleConfirm = (notification) => {
    const username = localStorage.getItem("username");
    const passwordAuth = localStorage.getItem("password");

    axios.put(`http://127.0.0.1:8000/api/chatapp/manage-interest/${notification.id}/`, { accepted: true }, {
      auth: {
        username: username,
        password: passwordAuth
      }
    })
    .then((response) => {
      setShowSuccessMessage(true);

      const updatedData = data.map(item => {
        if (item.id === notification.id) {
          return { ...item, accepted: true };
        }
        return item;
      });
      setData(updatedData);

      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowRejectedAlert(false);
      }, 2000);
    })
    .catch((error) => {
      console.error("Error confirming request:", error);
    });
  };

  useEffect(() => {
    localStorage.setItem("rejectedNotifications", JSON.stringify(rejectedNotifications));
  }, [rejectedNotifications]);

  const handleReject = (notification) => {
    const username = localStorage.getItem("username");
    const passwordAuth = localStorage.getItem("password");
  
    axios.put(`http://127.0.0.1:8000/api/chatapp/manage-interest/${notification.id}/`, { accepted: false, rejected: true }, {
      auth: {
        username: username,
        password: passwordAuth
      }
    })
   .then((response) => {
  
      const updatedData = data.map(item => {
        if (item.id === notification.id) {
          return {...item, accepted: false, rejected: true };
        }
        return item;
      });
      setData(updatedData);
  
      setRejectedNotifications((prevRejectedNotifications) => [
       ...prevRejectedNotifications,
        notification.id,
      ]);
  
      setShowRejectedAlert(true);
  
      setTimeout(() => {
        setShowRejectedAlert(false);
      }, 2000);
    })
   .catch((error) => {
      console.error("Error rejecting request:", error);
    });
  };
  
  return (
    <div>
      {showSuccessMessage && (
        <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '10px' }}>
          Request action performed successfully!
        </div>
      )}
      {showRejectedAlert && (
        <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '10px' }}>
        Request rejected successfully!
      </div>
      )}
      <MUIDataTable
        title={"Notifications"}
        data={data}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default Notifications;
