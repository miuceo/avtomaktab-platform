import { describe, it, expect } from "vitest";
import {
  liveEndsAt,
  canEnterLive,
  attemptDeadline,
  remainingSeconds,
  canAcceptAnswer,
  isAttemptOver,
  buildAttemptOrder,
  computeScore,
  classifyParticipant,
  pickBestAttempt,
  isCountedInLiveResults,
} from "./test-logic";

describe("Test Logic Engine (Brief 2)", () => {
  const MINUTE_MS = 60_000;

  describe("liveEndsAt & canEnterLive", () => {
    it("computes same ends_at for everybody", () => {
      const start = 1_000_000;
      const endsAt = liveEndsAt(start, 20);
      expect(endsAt).toBe(start + 20 * MINUTE_MS);
    });

    it("allows entry strictly before ends_at", () => {
      const endsAt = 2_000_000;
      expect(canEnterLive(1_999_999, endsAt)).toBe(true);
      expect(canEnterLive(2_000_000, endsAt)).toBe(false);
      expect(canEnterLive(2_000_001, endsAt)).toBe(false);
    });
  });

  describe("attemptDeadline & late join timing", () => {
    it("live test: late join gets only the remaining time (same ends_at)", () => {
      const assignmentEndsAt = 10_000_000;
      const lateStudentNow = assignmentEndsAt - 5 * MINUTE_MS; // joins with 5 mins left
      const deadline = attemptDeadline({
        kind: "live",
        nowMs: lateStudentNow,
        durationMinutes: 20,
        assignmentEndsAt,
      });
      expect(deadline).toBe(assignmentEndsAt);
      expect(remainingSeconds(lateStudentNow, deadline)).toBe(5 * 60);
    });

    it("open test: each attempt gets the full test duration from its own start", () => {
      const now = 5_000_000;
      const deadline = attemptDeadline({
        kind: "open",
        nowMs: now,
        durationMinutes: 30,
      });
      expect(deadline).toBe(now + 30 * MINUTE_MS);
      expect(remainingSeconds(now, deadline)).toBe(30 * 60);
    });
  });

  describe("canAcceptAnswer & isAttemptOver", () => {
    it("rejects answers after deadline (server time is the truth)", () => {
      const deadline = 5_000_000;
      expect(canAcceptAnswer(4_999_999, deadline, null)).toBe(true);
      expect(canAcceptAnswer(5_000_000, deadline, null)).toBe(false);
      expect(canAcceptAnswer(5_000_001, deadline, null)).toBe(false);
    });

    it("rejects answers if attempt was already finished", () => {
      const deadline = 5_000_000;
      expect(canAcceptAnswer(4_000_000, deadline, 4_500_000)).toBe(false);
    });

    it("determines if attempt is over", () => {
      const deadline = 5_000_000;
      expect(isAttemptOver(4_500_000, deadline, null)).toBe(false);
      expect(isAttemptOver(4_500_000, deadline, 4_600_000)).toBe(true);
      expect(isAttemptOver(5_000_000, deadline, null)).toBe(true);
      expect(isAttemptOver(5_000_001, deadline, null)).toBe(true);
    });
  });

  describe("buildAttemptOrder (random order stored server-side)", () => {
    it("shuffles both question order and answer order per question", () => {
      const mockQuestions = [
        { id: 101, answerIds: [1, 2, 3, 4] },
        { id: 102, answerIds: [5, 6, 7, 8] },
        { id: 103, answerIds: [9, 10, 11] },
      ];

      const order = buildAttemptOrder(mockQuestions);
      expect(order.questionOrder.sort((a, b) => a - b)).toEqual([101, 102, 103]);
      expect(order.answerOrder[101].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
      expect(order.answerOrder[102].sort((a, b) => a - b)).toEqual([5, 6, 7, 8]);
      expect(order.answerOrder[103].sort((a, b) => a - b)).toEqual([9, 10, 11]);
    });
  });

  describe("classifyParticipant (Teacher results & absent = Kelmadi)", () => {
    const liveEnds = 1_000_000;

    it("marks student as absent ('Kelmadi') if they never started before ends_at", () => {
      const status = classifyParticipant({
        kind: "live",
        attempts: [],
        nowMs: liveEnds + 1000, // test has ended
        liveEndsAt: liveEnds,
      });
      expect(status).toBe("absent");
    });

    it("marks student as not_started if live test is still running and they haven't joined yet", () => {
      const status = classifyParticipant({
        kind: "live",
        attempts: [],
        nowMs: liveEnds - 5000, // test still active
        liveEndsAt: liveEnds,
      });
      expect(status).toBe("not_started");
    });

    it("marks student as in_progress if an attempt is currently running", () => {
      const status = classifyParticipant({
        kind: "live",
        attempts: [{ deadline_at: liveEnds, finished_at: null }],
        nowMs: liveEnds - 10_000,
        liveEndsAt: liveEnds,
      });
      expect(status).toBe("in_progress");
    });

    it("marks student as finished if attempt was finished or deadline passed", () => {
      const status1 = classifyParticipant({
        kind: "live",
        attempts: [{ deadline_at: liveEnds, finished_at: liveEnds - 5000 }],
        nowMs: liveEnds,
        liveEndsAt: liveEnds,
      });
      expect(status1).toBe("finished");

      const status2 = classifyParticipant({
        kind: "live",
        attempts: [{ deadline_at: liveEnds, finished_at: null }],
        nowMs: liveEnds + 500, // deadline passed
        liveEndsAt: liveEnds,
      });
      expect(status2).toBe("finished");
    });
  });

  describe("isCountedInLiveResults", () => {
    it("does not count students who joined the group after the live test started", () => {
      const startedAt = 1_000_000;
      expect(
        isCountedInLiveResults({
          joinedAtMs: 900_000,
          liveStartedAtMs: startedAt,
          hasAttempt: false,
        })
      ).toBe(true);

      expect(
        isCountedInLiveResults({
          joinedAtMs: 1_100_000,
          liveStartedAtMs: startedAt,
          hasAttempt: false,
        })
      ).toBe(false);

      expect(
        isCountedInLiveResults({
          joinedAtMs: 1_100_000,
          liveStartedAtMs: startedAt,
          hasAttempt: true,
        })
      ).toBe(true);
    });
  });

  describe("pickBestAttempt & computeScore", () => {
    it("computes accurate score and percentage", () => {
      expect(computeScore(18, 20)).toEqual({ correct: 18, total: 20, percent: 90 });
      expect(computeScore(0, 20)).toEqual({ correct: 0, total: 20, percent: 0 });
      expect(computeScore(5, 0)).toEqual({ correct: 5, total: 0, percent: 0 });
    });

    it("picks highest score attempt, tie-breaking by earliest start", () => {
      const attempts = [
        { id: 1, correct: 15, started_at: 100 },
        { id: 2, correct: 18, started_at: 200 },
        { id: 3, correct: 18, started_at: 300 },
        { id: 4, correct: 12, started_at: 400 },
      ];
      expect(pickBestAttempt(attempts)?.id).toBe(2);
    });
  });
});
