import api from "@/lib/axios";

export const addReferencePoints = async (
  patientId: string,
  points: number,
  reason?: string
) => {
  const params = new URLSearchParams({
    patientId,
    points: points.toString(),
  });

  if (reason) params.append("reason", reason);

  const res = await api.post(`/admin/reference-points/add?${params.toString()}`);
  return res.data;
};


export const removeReferencePoints = async (payload: {
  patientId: string;
  pointsToRemove: number;
  reason?: string;
}) => {
  const res = await api.post(`/admin/reference-points/remove`, payload);
  return res.data;
};

