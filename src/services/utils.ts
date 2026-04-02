export async function checkDiskSpace(path: string) {
  // Mock implementation
  return {
    available: 1000 * 1024 * 1024,
    total: 2000 * 1024 * 1024
  };
}
