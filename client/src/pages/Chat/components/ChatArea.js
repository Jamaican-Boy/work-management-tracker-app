import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetMessages, SendMessage } from "../../../apicalls/chatApi/messages";
import { ClearChatMessages } from "../../../apicalls/chatApi/chats";
import { SetLoading } from "../../../redux/loadersSlice";
import { message } from "antd";
import moment from "moment";
import { SetAllChats } from "../../../redux/usersSlice";
import store from "../../../redux/store";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [isReceipentTyping, setIsReceipentTyping] = React.useState(false);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = React.useState("");
  const { selectedChat, user, allChats } = useSelector((state) => state.users);
  const [messages = [], setMessages] = React.useState([]);
  const receipentUser = selectedChat.members.find(
    (mem) => mem._id !== user._id
  );

  const sendNewMessage = async (image) => {
    try {
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image,
      };
      // send message to server using socket
      socket.emit("send-message", {
        ...message,
        members: selectedChat.members.map((mem) => mem._id),
        createdAt: moment().format("DD-MM-YYYY hh:mm:ss"),
        read: false,
      });

      // send message to server to save in db
      const response = await SendMessage(message);

      if (response.success) {
        setNewMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  };

  const getMessages = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetMessages(selectedChat._id);
      dispatch(SetLoading(false));
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chat: selectedChat._id,
        members: selectedChat.members.map((mem) => mem._id),
      });

      const response = await ClearChatMessages(selectedChat._id);

      if (response.success) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const getDateInRegualarFormat = (date) => {
    let result = "";

    // if date is today return time in hh:mm format
    if (moment(date).isSame(moment(), "day")) {
      result = moment(date).format("hh:mm");
    }
    // if date is yesterday return yesterday and time in hh:mm format
    else if (moment(date).isSame(moment().subtract(1, "day"), "day")) {
      result = `Yesterday ${moment(date).format("hh:mm")}`;
    }
    // if date is this year return date and time in MMM DD hh:mm format
    else if (moment(date).isSame(moment(), "year")) {
      result = moment(date).format("MMM DD hh:mm");
    }

    return result;
  };

  useEffect(() => {
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    // Socket event listeners setup
    const handleReceiveMessage = (message) => {
      const tempSelectedChat = store.getState().users.selectedChat;
      if (tempSelectedChat._id === message.chat) {
        setMessages((messages) => [...messages, message]);
      }

      if (
        tempSelectedChat._id === message.chat &&
        message.sender !== user._id
      ) {
        clearUnreadMessages();
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    const handleUnreadMessagesCleared = (data) => {
      const tempAllChats = store.getState().users.allChats;
      const tempSelectedChat = store.getState().users.selectedChat;

      if (data.chat === tempSelectedChat._id) {
        // update unreadmessages count in selected chat
        const updatedChats = tempAllChats.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            };
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));

        // set all messages as read
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            return {
              ...message,
              read: true,
            };
          });
        });
      }
    };

    socket.on("unread-messages-cleared", handleUnreadMessagesCleared);

    const handleStartedTyping = (data) => {
      const selctedChat = store.getState().users.selectedChat;
      if (data.chat === selctedChat._id && data.sender !== user._id) {
        setIsReceipentTyping(true);
      }
      setTimeout(() => {
        setIsReceipentTyping(false);
      }, 1500);
    };

    socket.on("started-typing", handleStartedTyping);

    // Cleanup function
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("unread-messages-cleared", handleUnreadMessagesCleared);
      socket.off("started-typing", handleStartedTyping);
    };
  }, [selectedChat]);

  useEffect(() => {
    // Always scroll to bottom for messages id
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages, isReceipentTyping]);

  const onUploadImageClick = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      sendNewMessage(reader.result);
    };
  };

  return (
    <div className="bg-white h-[82vh] border rounded-2xl w-full flex flex-col justify-between p-5">
      {/* 1st part receipent user */}
      <div>
        <div className="flex gap-5 items-center mb-2">
          {receipentUser.profilePic && (
            <img
              src={receipentUser.profilePic}
              alt="profile pic"
              className="w-10 h-10 rounded-full"
            />
          )}
          {!receipentUser.profilePic && (
            <div className="bg-gray-500  rounded-full h-10 w-10 flex items-center justify-center">
              <h1 className="uppercase text-xl font-semibold text-white">
                {receipentUser.firstName[0]}
              </h1>
            </div>
          )}
          <h1 className="uppercase">{receipentUser.firstName}</h1>
        </div>
        <hr />
      </div>

      {/* 2nd part chat messages */}
      <div className="h-[55vh] overflow-y-scroll p-5" id="messages">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => {
            const isCurrentUserIsSender = message.sender === user._id;
            return (
              <div className={`flex ${isCurrentUserIsSender && "justify-end"}`}>
                <div className="flex flex-col gap-1">
                  {message.text && (
                    <h1
                      className={`${
                        isCurrentUserIsSender
                          ? "bg-primary text-white rounded-bl-none"
                          : "bg-gray-300 text-primary rounded-tr-none"
                      } p-2 rounded-xl`}
                    >
                      {message.text}
                    </h1>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="message image"
                      className="w-24 h-24 rounded-xl"
                    />
                  )}
                  <h1 className="text-gray-500 text-sm">
                    {getDateInRegualarFormat(message.createdAt)}
                  </h1>
                </div>
                {isCurrentUserIsSender && message.read && (
                  <div className="p-2">
                    {receipentUser.profilePic && (
                      <img
                        src={receipentUser.profilePic}
                        alt="profile pic"
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {!receipentUser.profilePic && (
                      <div className="bg-gray-400 rounded-full h-4 w-4 flex items-center justify-center relative">
                        <h1 className="uppercase text-sm font-semibold text-white">
                          {receipentUser.firstName[0]}
                        </h1>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {isReceipentTyping && (
            <div className="pb-10">
              <h1 className="bg-blue-100 text-primary  p-2 rounded-xl w-max">
                typing...
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* 3rd part chat input */}

      <div className="h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center relative">
        {showEmojiPicker && (
          <div className="absolute -top-96 left-0">
            <EmojiPicker
              height={350}
              onEmojiClick={(e) => {
                setNewMessage(newMessage + e.emoji);
              }}
            />
          </div>
        )}

        <div className="flex gap-2 text-xl">
          <label for="file">
            <i class="ri-link cursor-pointer text-xl" typeof="file"></i>
            <input
              type="file"
              id="file"
              style={{
                display: "none",
              }}
              accept="image/gif,image/jpeg,image/jpg,image/png"
              onChange={onUploadImageClick}
            />
          </label>
          <i
            class="ri-emotion-line cursor-pointer text-xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          ></i>
        </div>

        <input
          type="text"
          placeholder="Type a message"
          className="w-[90%] border-0 h-full rounded-xl focus:border-none"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socket.emit("typing", {
              chat: selectedChat._id,
              members: selectedChat.members.map((mem) => mem._id),
              sender: user._id,
            });
          }}
        />
        <button
          className="bg-primary text-white py-1 px-5 rounded h-max"
          onClick={() => sendNewMessage("")}
        >
          <i className="ri-send-plane-2-line text-white"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
