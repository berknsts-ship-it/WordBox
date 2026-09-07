// Turns a vocabulary_folders.name into the code stored in students.textbook.
// Deliberately reproduces the existing hand-picked codes exactly (English File
// Elementary -> english_file_elementary, Go Getter 1 -> go_getter_1, etc.) so
// this can replace the old hardcoded TEXTBOOKS/TEXTBOOK_FOLDER_NAMES maps
// without touching any student's already-stored value.
export function slugifyTextbookName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
