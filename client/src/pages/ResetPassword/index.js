import React, { useState } from "react";
import { message, Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

        <Form onFinish={resetPassword}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              RESET PASSWORD
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ResetPassword;
