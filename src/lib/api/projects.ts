import apiClient from "./client";
import { User } from "@/types/models";
import { ProjectSchema } from "../validations/project.schema"; // Impor Tipe Input

// Definisikan tipe data Project
export interface Project {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	thumbnail: string | null;
	category: string;
	tags: string[];
	tech_stack: string[];
	status: string;
	visibility: string;
	author: User; // Relasi ke User
	stats: {
		views: number;
		likes: number;
		comments: number;
		saves: number;
	};
	content?: string; // 'content' opsional
	published_at: string;
	created_at: string;
}

// Tipe data Paginasi
export interface PaginatedResponse<T> {
	data: T[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: {
		current_page: number;
		from: number;
		last_page: number;
		path: string;
		per_page: number;
		to: number;
		total: number;
	};
}

// --- FUNGSI READ ---

// Fungsi untuk mengambil semua proyek (publik)
export const getProjects = async (): Promise<PaginatedResponse<Project>> => {
	const response = await apiClient.get("/projects");
	return response.data;
};

// Fungsi untuk mengambil satu proyek by slug
export const getProjectBySlug = async (slug: string): Promise<Project> => {
	const response = await apiClient.get(`/projects/${slug}`);
	return response.data.data; // Resource tunggal dibungkus 'data'
};

// --- FUNGSI CREATE ---

// Fungsi untuk membuat proyek baru
export const createProject = async (data: ProjectSchema): Promise<Project> => {
	const response = await apiClient.post("/projects", data);
	return response.data.data; // Resource tunggal dibungkus 'data'
};

// Fungsi untuk mengupdate proyek
export const updateProject = async ({
	slug,
	data,
}: {
	slug: string;
	data: ProjectSchema;
}): Promise<Project> => {
	// Kita pakai method PUT, tapi Laravel kadang butuh _method: 'PUT'
	// Namun, karena kita pakai 'apiClient' (axios) dan rute 'put', ini seharusnya aman.
	// Jika gagal, kita ganti jadi POST dengan { ...data, _method: 'PUT' }
	const response = await apiClient.put(`/projects/${slug}`, data);
	return response.data.data; // Resource tunggal dibungkus 'data'
};

// --- FUNGSI INTERAKSI ---

// Tipe data respons untuk like/save
interface InteractionResponse {
	message: string;
	like_count?: number;
	save_count?: number;
}

// --- FUNGSI LIKE ---
export const likeProject = async (
	slug: string
): Promise<InteractionResponse> => {
	const response = await apiClient.post(`/projects/${slug}/like`);
	return response.data;
};

export const unlikeProject = async (
	slug: string
): Promise<InteractionResponse> => {
	const response = await apiClient.delete(`/projects/${slug}/like`);
	return response.data;
};

// --- FUNGSI SAVE (BOOKMARK) ---
export const saveProject = async (
	slug: string
): Promise<InteractionResponse> => {
	const response = await apiClient.post(`/projects/${slug}/save`);
	return response.data;
};

export const unsaveProject = async (
	slug: string
): Promise<InteractionResponse> => {
	const response = await apiClient.delete(`/projects/${slug}/save`);
	return response.data;
};
