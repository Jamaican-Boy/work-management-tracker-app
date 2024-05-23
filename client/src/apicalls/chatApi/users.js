import { axiosInstance } from ".";

export const GetAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-all-users");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const UpdateProfilePicture = async (image) => {
  try {
    const response = await axiosInstance.post(
      "/api/users/update-profile-picture",
      {
        image,
      }
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
