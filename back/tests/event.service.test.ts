import { EventService } from "../src/modules/event/event.servcies";

describe("EventService", () => {
  it("should create event successfully", async () => {
    const service = new EventService();
    service["repo"] = {
      create: jest.fn().mockReturnValue({ name: "Concert" , description: "Concert description"}),
      save: jest.fn().mockResolvedValue({ id: 1, name: "Concert" , description: "Concert description"}),
    } as any;

    const result = await service.createEvent({ name: "Concert", userId: 1 });
    expect(result).toEqual({ id: 1, name: "Concert" , description: "Concert description"});
  });
});
