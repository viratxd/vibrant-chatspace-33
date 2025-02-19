
export const uploadImage = async (file: File, userEmail: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", userEmail);

  try {
    const response = await fetch("https://deepak191z-fastapi-img-link.hf.space/upload-image", {
      method: "POST",
      headers: { "accept": "application/json" },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Upload Failed:", error);
    throw error;
  }
};
