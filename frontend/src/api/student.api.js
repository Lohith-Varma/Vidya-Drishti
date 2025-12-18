import api from "./axiosConfig";

export const getStudentProfile = (email) => {
  return api
    .get(`/student/${encodeURIComponent(email)}`)
    .then((res) => res.data);
};
