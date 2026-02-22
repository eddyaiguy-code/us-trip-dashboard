export interface UploadStorage {
  save(file: File): Promise<string>;
}
