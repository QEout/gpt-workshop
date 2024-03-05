// Type: Module
// assistantModules.ts
import { fileService } from "../services/file";
import { convertFileToBase64 } from "../utils/convertFileToBase64";

/**
 * Prepares and uploads a file for the chat assistant.
 * This can include converting images to base64, handling different file types, etc.
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<string>} - The ID of the uploaded file.
 */
export const prepareUploadFile = async (
  file: File,
  setStatusMessage: (message: string) => void
): Promise<string> => {
  setStatusMessage("Preparing file for upload...");

  // If the file is an image, get a description from GPT-4 Vision API
  if (file.type.startsWith("image/")) {
    setStatusMessage("Converting image to base64...");
    const base64Image: string = (await convertFileToBase64(file)) as string;

    setStatusMessage("Getting image description...");
    const descriptionResponse:any = await fileService.uploadImageAndGetDescription(base64Image);

    setStatusMessage("Creating description file...");
    const descriptionBlob = new Blob([descriptionResponse.analysis], {
      type: "text/plain",
    });
    const descriptionFile = new File([descriptionBlob], "description.txt");

    setStatusMessage("Uploading description file...");
    console.log('file',descriptionFile)
    const uploadedFile = await fileService.uploadFile(
      descriptionFile
    );
    setStatusMessage(
      "Description file uploaded successfully. File ID: " + uploadedFile.fileId
    );
    return uploadedFile.fileId;
  }

  // If the file is not an image, upload it as a normal file
  setStatusMessage("Uploading file...");
  const uploadedFile = await fileService.uploadFile(file);
  setStatusMessage(
    "File uploaded successfully. File ID: " + uploadedFile.fileId
  );
  return uploadedFile.fileId;
};

// my-app/app/modules/assistantModules.ts
/**
 * Deletes a file from the chat assistant.
 * @param {string} fileId - The ID of the file to be deleted.
 * @returns {Promise<boolean>} - The status of the deletion.
 */
export const deleteUploadedFile = async (
  fileId: string,
  setStatusMessage: (message: string) => void
): Promise<boolean> => {
  setStatusMessage(`Gona Deleting file with ID: ${fileId}...`);
  console.log(`Gonna Deleting file with ID: ${fileId}...`);

  try {
    const deletionStatus = await fileService.deleteFile(fileId);
    setStatusMessage(`File with ID: ${fileId} deleted successfully.`);
    console.log(`File with ID: ${fileId} deleted successfully.`);
    return deletionStatus;
  } catch (error) {
    setStatusMessage(`Error deleting file with ID: ${fileId}.`);
    console.error("Error deleting file:", error);
    return false;
  }
};
