import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CreateNewChat, GetAllChats } from "../../../apicalls/chatApi/chats";
import { SetLoading } from "../../../redux/loadersSlice";
import { SetAllChats, SetSelectedChat } from "../../../redux/usersSlice";
import moment from "moment";
import store from "../../../redux/store";

function UsersList({ searchKey, socket, onlineUsers }) {
  const { allUsers, allChats, user, selectedChat } = useSelector(
    (state) => state.users
  );
  const dispatch = useDispatch();
  const [updateFlag, setUpdateFlag] = useState(false);

  const createNewChat = async (receipentUserId) => {
    try {
      dispatch(SetLoading(true));
      const response = await CreateNewChat([user._id, receipentUserId]);
      dispatch(SetLoading(false));
      if (response.success) {
        message.success(response.message);
        setUpdateFlag(!updateFlag); // Trigger refresh
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const openChat = (receipentUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((mem) => mem._id).includes(user._id) &&
        chat.members.map((mem) => mem._id).includes(receipentUserId)
    );
    if (chat) {
      dispatch(SetSelectedChat(chat));
    }
  };

  const fetchChats = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetAllChats();
      dispatch(SetLoading(false));
      if (response.success) {
        dispatch(SetAllChats(response.data));
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const getData = () => {
    try {
      if (searchKey === "") {
        return allChats || [];
      }

      // Filter users
      const filteredUsers = allUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchKey.toLowerCase())
      );

      // Filter chats
      const filteredChats = allChats.filter((chat) =>
        chat.members.some((mem) =>
          [mem.firstName, mem.lastName].some((name) =>
            name.toLowerCase().includes(searchKey.toLowerCase())
          )
        )
      );

      // Combine unique results based on user IDs
      const combinedResults = [
        ...new Map(
          [
            ...filteredUsers.map((user) => ({ ...user, isChatUser: false })),
            ...filteredChats.map((chat) => ({
              ...chat.members.find((mem) => mem._id !== user._id),
              isChatUser: true,
            })),
          ].map((item) => [item._id, item])
        ).values(),
      ];

      return combinedResults;
    } catch (error) {
      return [];
    }
  };

  const getIsSelctedChatOrNot = (userObj) => {
    if (selectedChat) {
      return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
    }
    return false;
  };

  const getDateInRegualarFormat = (date) => {
    let result = "";

    if (moment(date).isSame(moment(), "day")) {
      result = moment(date).format("hh:mm");
    } else if (moment(date).isSame(moment().subtract(1, "day"), "day")) {
      result = `Yesterday ${moment(date).format("hh:mm")}`;
    } else if (moment(date).isSame(moment(), "year")) {
      result = moment(date).format("MMM DD hh:mm");
    }

    return result;
  };

  const getLastMsg = (userObj) => {
    const chat = allChats.find((chat) =>
      chat.members.map((mem) => mem._id).includes(userObj._id)
    );
    if (!chat || !chat.lastMessage) {
      return "";
    } else {
      const lastMsgPerson =
        chat?.lastMessage?.sender === user._id ? "You : " : "";
      return (
        <div className="flex justify-between w-72">
          <h1 className="text-gray-600 text-sm">
            {lastMsgPerson} {chat?.lastMessage?.text}
          </h1>
          <h1 className="text-gray-500 text-sm">
            {getDateInRegualarFormat(chat?.lastMessage?.createdAt)}
          </h1>
        </div>
      );
    }
  };

  const getUnreadMessages = (userObj) => {
    const chat = allChats.find((chat) =>
      chat.members.map((mem) => mem._id).includes(userObj._id)
    );
    if (
      chat &&
      chat?.unreadMessages &&
      chat?.lastMessage?.sender !== user._id
    ) {
      return (
        <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {chat?.unreadMessages}
        </div>
      );
    }
  };

  useEffect(() => {
    fetchChats();
  }, [updateFlag]);

  useEffect(() => {
    socket.on("receive-message", (message) => {
      const tempSelectedChat = store.getState().users.selectedChat;
      let tempAllChats = store.getState().users.allChats;
      if (tempSelectedChat?._id !== message.chat) {
        const updatedAllChats = tempAllChats.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              unreadMessages: (chat?.unreadMessages || 0) + 1,
              lastMessage: message,
              updatedAt: message.createdAt,
            };
          }
          return chat;
        });
        tempAllChats = updatedAllChats;
      }

      const latestChat = tempAllChats.find((chat) => chat._id === message.chat);
      const otherChats = tempAllChats.filter(
        (chat) => chat._id !== message.chat
      );
      tempAllChats = [latestChat, ...otherChats];
      dispatch(SetAllChats(tempAllChats));
    });
  }, [socket]);

  useEffect(() => {
    getData();
  }, [searchKey]);

  return (
    <div className="flex flex-col gap-3 mt-5 lg:w-96 xl:w-96 md:w-60 sm:w-60">
      {getData().map((chatObjOrUserObj) => {
        if (!chatObjOrUserObj) return null; // Add this check

        let userObj = chatObjOrUserObj;

        if (chatObjOrUserObj.isChatUser) {
          userObj = chatObjOrUserObj;
        } else {
          userObj = chatObjOrUserObj.members
            ? chatObjOrUserObj.members.find((mem) => mem._id !== user._id)
            : chatObjOrUserObj;
        }

        return (
          <div
            className={`shadow-sm border p-2 rounded-xl bg-white flex justify-between items-center cursor-pointer w-full
                ${getIsSelctedChatOrNot(userObj) && "border-primary border-2"}
            `}
            key={userObj._id}
            onClick={() => openChat(userObj._id)}
          >
            <div className="flex gap-5 items-center">
              {userObj.profilePic && (
                <img
                  src={userObj.profilePic}
                  alt="profile pic"
                  className="w-10 h-10 rounded-full"
                />
              )}
              {!userObj.profilePic && (
                <div className="bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative">
                  <h1 className="uppercase text-xl font-semibold text-white">
                    {userObj.firstName[0]}
                  </h1>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="flex gap-1 items-center">
                    <h1>{userObj.firstName}</h1>
                    {onlineUsers.includes(userObj._id) && (
                      <div>
                        <div className="bg-green-700 h-3 w-3 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getUnreadMessages(userObj)}
                </div>
                {getLastMsg(userObj)}
              </div>
            </div>
            <div onClick={() => createNewChat(userObj._id)}>
              {!allChats.find((chat) =>
                chat.members.map((mem) => mem._id).includes(userObj._id)
              ) && (
                <button className="border-primary border text-primary bg-white p-1 rounded">
                  Create Chat
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UsersList;
