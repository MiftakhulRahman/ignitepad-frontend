import { User } from "@/types/models";
import apiClient from "./client";
import { PaginatedResponse } from "./projects";

export const adminGetUsers = async (): Promise<PaginatedResponse<User>> => {
	const response = await apiClient.get("/admin/users");
	return response.data;
};

// (Nanti kita tambah update, delete)
