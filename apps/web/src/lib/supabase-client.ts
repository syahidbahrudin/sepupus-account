import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
const STORAGE_BUCKET = "accounting-files";

/**
 * Upload a file to Supabase storage
 * @param file - The file to upload
 * @param folder - The folder path (e.g., 'receipts', 'expenses')
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
	file: File,
	folder: string = "uploads"
): Promise<string> {
	try {
		// Generate unique filename
		const timestamp = Date.now();
		const fileName = `${folder}/${timestamp}-${file.name}`;

		// Upload file
		const { data, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(fileName, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			throw error;
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

		return publicUrl;
	} catch (error) {
		console.error("Error uploading file:", error);
		throw new Error("Failed to upload file");
	}
}

/**
 * Delete a file from Supabase storage
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteFile(fileUrl: string): Promise<void> {
	try {
		// Extract file path from URL
		const url = new URL(fileUrl);
		const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`);
		if (pathParts.length < 2) {
			throw new Error("Invalid file URL");
		}
		const filePath = pathParts[1];

		// Delete file
		const { error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.remove([filePath]);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting file:", error);
		throw new Error("Failed to delete file");
	}
}

/**
 * Get a signed URL for a private file
 * @param filePath - The path to the file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
	filePath: string,
	expiresIn: number = 3600
): Promise<string> {
	try {
		const { data, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.createSignedUrl(filePath, expiresIn);

		if (error) {
			throw error;
		}

		return data.signedUrl;
	} catch (error) {
		console.error("Error getting signed URL:", error);
		throw new Error("Failed to get signed URL");
	}
}

