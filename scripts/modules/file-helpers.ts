// Check if file is a dot file
export const isDotFile = (filePath: string): boolean => {
  return filePath.split("/").some(part => part.startsWith("."));
};
