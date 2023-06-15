import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Friends.css"
import { Avatar } from '../Avatar';

//Mettre un useState refresh automatique
function Online(data: any) {
  return <div className="online">
    <div className="status">{(data.inGame === true) ? "In game" : "In menu"}</div>
  </div>
}

function Offline() {
  return <div className="offline"></div>
}


function FriendsList() { 
        const [dataOnline, setDataOnline] = useState([{
            nickname: "",
            avatarUrl: "",
            online: false,
            inGame: false,
        }]);

        const [dataOffline, setDataOffline] = useState([{
          nickname: "",
          avatarUrl: "",
          online: false,
          inGame: false,
      }]);

    const token = localStorage.getItem("token");
    
    useEffect(() => {
        async function fetchDataOnline() {
            await axios.get("http://localhost:5400/user/friends/online", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((res) => {
                setDataOnline(res.data);
            });
        }
        async function fetchDataOffline() {
          await axios.get("http://localhost:5400/user/friends/offline", {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          })
          .then((res) => {
              setDataOffline(res.data);
          });
      }
        fetchDataOnline();
        fetchDataOffline();
    }, []);


   if ((dataOnline && dataOnline[0]) || (dataOffline && dataOffline[0])) {
    return <> 
    <ul>
      {dataOnline.map(dataOnline => {
        return <div className="friends" key={dataOnline.nickname}>
          <div>
            <p  className="friendsImg"><Avatar size="50px" img={dataOnline.avatarUrl} /></p>
            {<Online inGame={dataOnline.inGame}/>}
          </div>
            <p className="nickname">{dataOnline.nickname}</p>
          </div>;
      })}
      {dataOffline.map(dataOffline => {
        return <div className="friends" key={dataOffline.nickname}>
          <div>
            <p  className="friendsImg"><Avatar size="50px" img={dataOffline.avatarUrl} /></p>
            {<Offline />}
          </div>
            <p className="nickname">{dataOffline.nickname}</p>
          </div>;
      })}
    </ul>
</>
   }
   else
    return <div>No Friends</div>
}
        
export function Friends() {
    return <div>
        <FriendsList />
    </div>;
}
