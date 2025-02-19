
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2 } from "lucide-react";

interface UploadSectionProps {
  loading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  image: File | null;
}

export const UploadSection = ({
  loading,
  onImageUpload,
  onSubmit,
  image
}: UploadSectionProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Image</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
          <Input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">
              Click to upload image
            </span>
          </label>
        </div>
        {image && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="max-h-48 rounded-lg mx-auto"
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !image}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Process Image"
        )}
      </Button>
    </form>
  );
};
