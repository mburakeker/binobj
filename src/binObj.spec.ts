import * as fs from "fs";
import * as readline from "readline";
import { BinObj, run } from "./binObj";

jest.mock("fs");
jest.mock("readline");

describe("getBuildFolders", () => {
  it("should return an array of build folders", () => {
    // Arrange

    (fs.readdirSync as jest.Mock)
      .mockImplementationOnce(() => ["bin", "obj"])
      .mockReturnValue([]);
    (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });

    // Act
    const result = BinObj.getBuildFolders("/mock/root");

    // Assert
    expect(result.length).toEqual(2);
  });

  it("should handle errors and log a message", () => {
    // Arrange
    (fs.readdirSync as jest.Mock).mockImplementation(() => {
      throw new Error("Mock error");
    });
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    const result = BinObj.getBuildFolders("/mock/root");

    // Assert
    expect(result).toEqual([]);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error occurred while gathering directory paths!",
      expect.any(Error)
    );
  });
});

describe("confirmDelete", () => {
  it("should return true for 'y' input", async () => {
    // Arrange
    (readline.createInterface as jest.Mock).mockReturnValue({
      question: jest.fn().mockImplementationOnce((_, cb) => cb("y")),
      close: jest.fn(),
    });

    // Act
    const result = await BinObj.confirmDelete(["/mock/folder"]);

    // Assert
    expect(result).toBe(true);
  });

  it("should return false for 'n' input", async () => {
    // Arrange
    (readline.createInterface as jest.Mock).mockReturnValue({
      question: jest.fn().mockImplementationOnce((_, cb) => cb("n")),
      close: jest.fn(),
    });

    // Act
    const result = await BinObj.confirmDelete(["/mock/folder"]);

    // Assert
    expect(result).toBe(false);
  });
  it.each(["b", "v", "c", "l"])(
    "should return false for inputs that are not 'y' or 'n', e.g: '%s'",
    async (input) => {
      // Arrange
      (readline.createInterface as jest.Mock).mockReturnValue({
        question: jest.fn().mockImplementationOnce((_, cb) => cb(input)),
        close: jest.fn(),
      });

      // Act
      const result = await BinObj.confirmDelete(["/mock/folder"]);

      // Assert
      expect(result).toBe(false);
    }
  );
});

describe("deleteFolders", () => {
  it("should call fs.rm for each folder path", () => {
    // Arrange
    const mockCallback = jest.fn();
    (fs.rm as unknown as jest.Mock).mockImplementation(mockCallback);

    const folderPaths = ["/mock/folder1", "/mock/folder2"];

    // Act
    BinObj.deleteFolders(folderPaths);

    // Assert
    expect(mockCallback).toHaveBeenCalledTimes(folderPaths.length);
    for (const folderPath of folderPaths) {
      expect(mockCallback).toHaveBeenCalledWith(
        folderPath,
        { recursive: true },
        expect.any(Function)
      );
    }
  });

  it("should log 'Folders not found.' if no build folders are present", async () => {
    // Arrange
    jest.spyOn(fs, "readdirSync").mockReturnValue([]);
    const logSpy = jest.spyOn(console, "log");

    // Act
    await run();
    
    // Assert
    expect(logSpy).toHaveBeenCalledWith("Folders not found.");
  });

  it("should call confirmDelete and deleteFolders when build folders are present", async () => {
    // Arrange
    const folders = ["/mock/root/bin", "/mock/root/obj"];
    const getBuildFoldersMock = jest.spyOn(BinObj, "getBuildFolders");
    getBuildFoldersMock.mockImplementation(() => folders);

    const confirmDeleteMock = jest.spyOn(BinObj, "confirmDelete");
    confirmDeleteMock.mockImplementation(async () => true);

    const deleteFoldersMock = jest.spyOn(BinObj, "deleteFolders");
    deleteFoldersMock.mockImplementation(() => {});

    // Act
    await run();

    // Assert
    expect(getBuildFoldersMock).toHaveBeenCalled();
    expect(confirmDeleteMock).toHaveBeenCalledWith(folders);
    expect(deleteFoldersMock).toHaveBeenCalledWith(folders);
  });

  it("should log a message when no folders found", async () => {
    // Arrange
    const folders: string[] = [];
    const getBuildFoldersMock = BinObj.getBuildFolders as jest.Mock;
    getBuildFoldersMock.mockReturnValue(folders);

    const logSpy = jest.spyOn(console, "log");

    // Act
    await run();

    // Assert
    expect(logSpy).toHaveBeenCalledWith("Folders not found.");
  });

  it("should log a message when user cancels during confirmation", async () => {
    // Arrange
    const folders = ["/mock/root/bin", "/mock/root/obj"];
    const getBuildFoldersMock = BinObj.getBuildFolders as jest.Mock;
    getBuildFoldersMock.mockReturnValue(folders);

    const confirmDeleteMock = BinObj.confirmDelete as jest.Mock;
    confirmDeleteMock.mockResolvedValue(false);

    const logSpy = jest.spyOn(console, "log");

    // Act
    await run();

    // Assert
    expect(logSpy).toHaveBeenCalledWith("Deletion cancelled by user.");
  });
});
