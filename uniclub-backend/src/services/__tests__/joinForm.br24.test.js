const mongoose = require("mongoose");
const joinFormService = require("../president/joinFormManagement.service");
const JoinForm = require("../../models/join_form.model");
const JoinRequest = require("../../models/join_request.model");
const ClubMember = require("../../models/club_member.model");

jest.mock("../../models/join_form.model");
jest.mock("../../models/join_request.model");
jest.mock("../../models/club_member.model");

describe("BR-24 Join Form Locking Business Rule", () => {
  const clubId = new mongoose.Types.ObjectId().toString();
  const formId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getJoinForm", () => {
    test("returns is_locked = true and response_count when form has responses", async () => {
      const mockForm = {
        _id: formId,
        club_id: clubId,
        title: "Test Form",
        questions: [{ content: "Why join?" }],
      };

      JoinForm.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockForm]),
          }),
        }),
      });

      JoinRequest.countDocuments.mockResolvedValue(3);
      ClubMember.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await joinFormService.getJoinForm(clubId);

      expect(result[0].response_count).toBe(3);
      expect(result[0].is_locked).toBe(true);
    });

    test("returns is_locked = false when form has 0 responses", async () => {
      const mockForm = {
        _id: formId,
        club_id: clubId,
        title: "Test Form",
        questions: [{ content: "Why join?" }],
      };

      JoinForm.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockForm]),
          }),
        }),
      });

      JoinRequest.countDocuments.mockResolvedValue(0);
      ClubMember.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await joinFormService.getJoinForm(clubId);

      expect(result[0].response_count).toBe(0);
      expect(result[0].is_locked).toBe(false);
    });
  });

  describe("updateJoinForm", () => {
    test("allows modifying questions when form has 0 responses", async () => {
      const existingForm = {
        _id: formId,
        club_id: clubId,
        title: "Old Title",
        description: "Old Desc",
        questions: [{ content: "Old question 1" }],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          title: "New Title",
          questions: [{ content: "New question 1" }],
        }),
      };

      JoinForm.findOne.mockResolvedValue(existingForm);
      JoinRequest.countDocuments.mockResolvedValue(0);

      const result = await joinFormService.updateJoinForm({
        clubId,
        formId,
        title: "New Title",
        questions: ["New question 1"],
      });

      expect(existingForm.save).toHaveBeenCalled();
      expect(existingForm.title).toBe("New Title");
      expect(existingForm.questions).toEqual(["New question 1"]);
    });

    test("blocks structural modification of questions when form has responses (>0)", async () => {
      const existingForm = {
        _id: formId,
        club_id: clubId,
        title: "Old Title",
        description: "Old Desc",
        questions: [{ content: "Old question 1" }],
        save: jest.fn(),
      };

      JoinForm.findOne.mockResolvedValue(existingForm);
      JoinRequest.countDocuments.mockResolvedValue(2);

      await expect(
        joinFormService.updateJoinForm({
          clubId,
          formId,
          questions: ["Old question 1", "Brand new question 2"],
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Structural modification of questions is no longer allowed"),
      });

      expect(existingForm.save).not.toHaveBeenCalled();
    });

    test("allows updating title & description when questions remain structurally unchanged even with responses", async () => {
      const existingForm = {
        _id: formId,
        club_id: clubId,
        title: "Old Title",
        description: "Old Desc",
        questions: [{ content: "Question 1" }, { content: "Question 2" }],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          title: "Updated Title",
          description: "Updated Description",
        }),
      };

      JoinForm.findOne.mockResolvedValue(existingForm);
      // Even if responseCount > 0, questions are unchanged
      JoinRequest.countDocuments.mockResolvedValue(5);

      const result = await joinFormService.updateJoinForm({
        clubId,
        formId,
        title: "Updated Title",
        description: "Updated Description",
        questions: ["Question 1", "Question 2"], // Unchanged questions sent by frontend
      });

      expect(existingForm.save).toHaveBeenCalled();
      expect(existingForm.title).toBe("Updated Title");
      expect(existingForm.description).toBe("Updated Description");
    });
  });

  describe("deleteJoinForm", () => {
    test("blocks deleting form when form has responses (>0)", async () => {
      const existingForm = {
        _id: formId,
        club_id: clubId,
      };

      JoinForm.findOne.mockResolvedValue(existingForm);
      JoinRequest.countDocuments.mockResolvedValue(1);

      await expect(
        joinFormService.deleteJoinForm({ clubId, formId })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Cannot delete form that has received 1 student response(s)"),
      });

      expect(JoinForm.deleteOne).not.toHaveBeenCalled();
    });

    test("allows deleting form when form has 0 responses", async () => {
      const existingForm = {
        _id: formId,
        club_id: clubId,
      };

      JoinForm.findOne.mockResolvedValue(existingForm);
      JoinRequest.countDocuments.mockResolvedValue(0);
      JoinForm.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await joinFormService.deleteJoinForm({ clubId, formId });

      expect(JoinForm.deleteOne).toHaveBeenCalledWith({ _id: formId, club_id: clubId });
      expect(result.message).toContain("deleted successfully");
    });
  });
});
