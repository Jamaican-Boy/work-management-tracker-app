import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { SetButtonLoading } from "../../redux/loadersSlice";

function VerifyEmail() {
  const [emailVerified, setEmailVerified] = useState("");
  const params = useParams();
  const dispatch = useDispatch();

  const verifyToken = async () => {
    try {
      dispatch(SetButtonLoading(true));
      const response = await axios.post("/api/users/verifyemail", {
        token: params.token,
      });

      if (response.data.success) {
        setEmailVerified("true");
      } else {
        setEmailVerified("false");
      }

      dispatch(SetButtonLoading(false));
    } catch (error) {
      dispatch(SetButtonLoading(false));
      setEmailVerified("false");
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <div className="flex min-h-screen p-5 justify-center items-center">
      {emailVerified === "" && (
        <h1 className="text-primary text-4xl">
          Please wait we are verifying your email
        </h1>
      )}

      {emailVerified === "true" && (
        <h1 className="text-primary text-4xl">
          Your email verified successfully 
        </h1>
      )}

      {emailVerified === "false" && (
        <div>
          <h1 className="text-primary text-4xl">
            <span>Invalid or Expired Token</span>
            <br />
            <span className="block text-center">
              Please{" "}
              <Link to="/register" className="text-red-600">
                Register
              </Link>{" "}
              Again!
            </span>
          </h1>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
