export const linkToTitle = (link: string): string => {
  const parts = link.split("/");
  return parts[parts.length - 1].replace("_", " ");
};
