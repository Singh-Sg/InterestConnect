import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import axios from 'axios';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import MessageIcon from '@mui/icons-material/Message';
import { Link, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import '../CSS/DataShow.css'

const DataShow = () => {
  const [data, setData] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedAccepted, setSelectedAccepted] = useState([])
  const [ReqStatus, SetReqStatus]  = useState([]);
  const Navigate = useNavigate();
  const columns = [ 
    {
      name: "id",
      label: "ID",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "username",
      label: "Name",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "Request",
      label: "Request",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const user = data[tableMeta.rowIndex];
          if (!user) return null;

          const  reqStatus = ReqStatus.some(obj => obj.hasOwnProperty('sender') && obj.sender === user.username);
    
          if (reqStatus) {
            return (
              <button
                disabled='true'
                style={{
                  backgroundColor: '#36A50A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'not-allowed'
                }}
              >
                Request Accepted
              </button>
            );
          } else {
            
            return (
              <button
                onClick={() => handleRequest(user.username, user.id, "Hello, I want to connect")}
                style={{
                  backgroundColor: 'rgba(33, 150, 243, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Request
              </button>
            );
          } 
        }
      }
    },
    {
      name: "message",
      label: "Message",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const user = data[tableMeta.rowIndex];
          if (!user) return null;
          const  reqStatus = ReqStatus.some(obj => obj.hasOwnProperty('sender') && obj.sender === user.username);
          
          if(reqStatus){
            return (
              <button
                onClick={() => handleClickMessage(user.id)}
                style={{
                  backgroundColor: '#03DAC5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <MessageIcon style={{ fontSize: '18px', marginRight: '8px' }} />
                Message
              </button>
            );
          }else{
            return(
              <span>...</span>
            )
          }
        }
      }
    },
  ];

  const options = {
    
    responsive: 'standard',
    rowStyle: (row, index) => {
      if (index % 2 === 0) {
        return { backgroundColor: '#FFC0CB' }; 
      } else {
        return { backgroundColor: '#FF69B4' }; 
      }
    },
  };

  const handleRequest = (username, id, message) => {
    const usernameAuth = localStorage.getItem("username");
    const passwordAuth = localStorage.getItem("password");

    setPendingRequests(prev => new Set([...prev, id]));

    axios.post("http://127.0.0.1:8000/api/chatapp/interest/", {
      receiver: id,
      message: message
    }, {
      auth: {
        username: usernameAuth,
        password: passwordAuth
      }
    })
      .then((response) => {
        const updatedData = data.map((user) => {
          if (user.id === id) {
            return { ...user, accepted: response.data.accepted };
          }
          return user;
        });
        setData(updatedData);

        setShowNotification(true);
        setNotificationMessage(`Request sent to ${username}`);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);

        setPendingRequestsCount(prevCount => prevCount + 1);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400 && error.response.data.message === "You have already sent a request to this receiver") {
          console.error("Error sending request:", error.response.data.message);
          alert(error.response.data.message);
        } else {
          console.error("Error sending request:", error);
        }
      })
      .finally(() => {
        setPendingRequests(prev => {
          const updatedSet = new Set(prev);
          updatedSet.delete(id);
          return updatedSet;
        });
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    window.location.href = "/";
  };

  const handleClickMessage = (receiverId) => {
    setSelectedReceiverId(receiverId);
    Navigate(`/chat/${receiverId}`);
  };


  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    axios.get("http://127.0.0.1:8000/api/chatapp/users/", {
      auth: {
        username,
        password
      }
    })
      .then((response) => {
        const userData = response.data.map((user) => ({ ...user, accepted: false }));
        setData(userData);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

  }, []);



  useEffect(()=>{
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    axios.get('http://127.0.0.1:8000/api/chatapp/manage-interest/',{
      auth: {
        username,
        password
      }
    }).then((res)=>{
      SetReqStatus(res.data);
    })
  },[]);


  return (
    <div style={{ maxWidth: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{marginLeft:"703px"}}>Users List</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showNotification && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#4caf50', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '10px' }}>
              <NotificationAddIcon style={{ marginRight: '5px' }} />
              {notificationMessage}
            </div>
          )}
          <Link to="/notification">
            <NotificationAddIcon style={{ marginRight: '20px' , color: '#009579'}} />
            {pendingRequestsCount > 0 && (
              <span style={{ backgroundColor: 'white', color: 'black',borderRadius: '50%', fontSize: '12px' }}>{pendingRequestsCount}</span>
            )}
          </Link>

          <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#009579', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
      <MUIDataTable
        data={data}
        columns={columns}
        options={options}
        style={{marginRight:"90px",marginLeft:"113px",marginTop:"75px"
        }}
      />

    </div>
  );
};

export default DataShow;

