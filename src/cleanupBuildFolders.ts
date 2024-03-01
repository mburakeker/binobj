import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

function getBuildFolders(rootPath: string): string[] {
  try {
    const foldersToRetrieve = ["bin", "obj"];
    const folderPaths: string[] = [];

    function gatherFoldersRecursively(directory: string): void {
      const items = fs.readdirSync(directory);

      items.forEach((item) => {
        const itemPath = path.join(directory, item);
        const isDirectory = fs.statSync(itemPath).isDirectory();

        if (isDirectory) {
          gatherFoldersRecursively(itemPath);

          if (foldersToRetrieve.includes(item)) {
            folderPaths.push(itemPath);
          }
        }
      });
    }

    gatherFoldersRecursively(rootPath);
    return folderPaths;
  } catch (error) {
    console.error("Error occurred while gathering directory paths!", error);
    return [];
  }
}

function confirmDelete(folders: string[]): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `Following folders will be deleted:\n
${folders.join("\n")}\n
Are you sure you want to delete them? (y/n):`,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      }
    );
  });
}

function deleteFolders(folderPaths: string[]): void {
  for (const folderPath of folderPaths) {
    fs.rm(folderPath, { recursive: true }, (error) => {
      if (error) {
        console.error(`Error occurred while deleting ${folderPath}!`, error);
      } else {
        console.log(`${folderPath} folder deleted successfully.`);
      }
    });
  }
}

export async function run() {
  const foldersToDelete = getBuildFolders(process.cwd());

  if (foldersToDelete.length === 0) {
    console.log("Folders not found.");
    return;
  }

  const confirm = await confirmDelete(foldersToDelete);

  if (confirm) {
    deleteFolders(foldersToDelete);
  } else {
    console.log("Deletion cancelled by user.");
  }
}
