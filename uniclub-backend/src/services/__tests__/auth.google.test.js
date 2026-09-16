const authService = require("../auth.service");
const User = require("../../models/user.model");

jest.mock("../../models/user.model");

describe("BR-01 Google OAuth School Domain Email Verification", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("blocks standard personal Gmail accounts (@gmail.com)", async () => {
    const profile = {
      id: "google-123",
      displayName: "Personal User",
      emails: [{ value: "personal.student@gmail.com" }],
    };

    await expect(authService.findOrCreateGoogleUser(profile)).rejects.toMatchObject({
      message: "Only FPT email is allowed",
      statusCode: 400,
    });
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  test("blocks other non-FPT emails (@yahoo.com, etc.)", async () => {
    const profile = {
      id: "google-456",
      displayName: "Another Domain User",
      emails: [{ value: "user@yahoo.com" }],
    };

    await expect(authService.findOrCreateGoogleUser(profile)).rejects.toMatchObject({
      message: "Only FPT email is allowed",
      statusCode: 400,
    });
  });

  test("blocks when email is missing", async () => {
    const profile = {
      id: "google-789",
      displayName: "No Email User",
      emails: [],
    };

    await expect(authService.findOrCreateGoogleUser(profile)).rejects.toMatchObject({
      message: "No email found",
      statusCode: 400,
    });
  });

  test("accepts valid lowercase school domain email (@fpt.edu.vn)", async () => {
    const profile = {
      id: "google-001",
      displayName: "Nguyen Van A",
      emails: [{ value: "anvce123456@fpt.edu.vn" }],
      photos: [{ value: "https://example.com/avatar.jpg" }],
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "mongo-user-1",
      email: "anvce123456@fpt.edu.vn",
      full_name: "Nguyen Van A",
      provider: "google",
      provider_id: "google-001",
      role: "student",
    });

    const user = await authService.findOrCreateGoogleUser(profile);

    expect(User.findOne).toHaveBeenCalledWith({ email: "anvce123456@fpt.edu.vn" });
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "anvce123456@fpt.edu.vn",
        provider: "google",
        provider_id: "google-001",
        full_name: "Nguyen Van A",
      })
    );
    expect(user.email).toBe("anvce123456@fpt.edu.vn");
  });

  test("accepts uppercase / mixed case school domain email (@FPT.EDU.VN) and normalizes it", async () => {
    const profile = {
      id: "google-002",
      displayName: "Nguyen Van B",
      emails: [{ value: "  BNVCE987654@FPT.EDU.VN  " }],
      photos: [],
    };

    const mockExistingUser = {
      _id: "mongo-user-2",
      email: "bnvce987654@fpt.edu.vn",
      full_name: "Nguyen Van B",
      provider: "google",
      role: "student",
    };
    User.findOne.mockResolvedValue(mockExistingUser);

    const user = await authService.findOrCreateGoogleUser(profile);

    expect(User.findOne).toHaveBeenCalledWith({ email: "bnvce987654@fpt.edu.vn" });
    expect(user).toEqual(mockExistingUser);
    expect(User.create).not.toHaveBeenCalled();
  });
});
