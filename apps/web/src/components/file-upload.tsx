"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/supabase-client";
import { Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  currentFileUrl?: string;
  folder?: string;
  accept?: string;
  label?: string;
}

export function FileUpload({
  onFileUploaded,
  currentFileUrl,
  folder = "uploads",
  accept = "image/*,.pdf",
  label = "Upload File",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(currentFileUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const url = await uploadFile(file, folder);
      setFileUrl(url);
      onFileUploaded(url);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileUrl("");
    onFileUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : fileUrl ? "Change File" : "Choose File"}
        </Button>
        {fileUrl && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {fileUrl && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileIcon className="h-4 w-4" />
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
}
