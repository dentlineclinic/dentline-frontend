import api from "@/lib/axios";

export const getAdminReviews = async (page = 0, size = 10) => {
  const response = await api.get(`/reviews?page=${page}&size=${size}`);
  return response.data;
};

export const submitReview = async (data: {
  appointmentId: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post("/reviews", data);
  return response.data;
};