import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const params = useParams();
  const navigate = useNavigate();

  const resetPassword = async () => {
    try {
      message.loading({
        content: "Resetting password...",
        key: "resettingPassword",
      });
      const response = await axios.post("/api/users/reset-password", {
        password,
        token: params.token,
      });
      if (response.data.success) {
        message.success(response.data.message);
        navigate("/login");
      } else {
        message.error("Expired or Invalid Link");
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      message.destroy("resettingPassword");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[400px] flex space-y-5 flex-col p-5 shadow-lg border border-gray-300">
        <h1 className="font-semibold text-3xl text-primary">
          CHANGE YOUR PASSWORD
        </h1>

        <input
          type="password"
          className="py-1 px-3 border-2 border-secondary focus:outline-none w-full"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <input
          type="password"
          className="py-1 px-3 border-2 border-secondary focus:outline-none w-full"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmpassword}
        />

        <div className="flex justify-between items-end">
          <button
            className="py-1 px-5 text-white bg-primary"
            onClick={resetPassword}
          >
            RESET PASSWORD
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;