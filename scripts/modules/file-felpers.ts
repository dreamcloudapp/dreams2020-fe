// Check if file is a dot file
export const isDotPath = (filePath: string): boolean => {
  return filePath.split("/").some(part => part.startsWith("."));
};
