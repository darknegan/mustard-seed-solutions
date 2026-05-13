import type { HttpErrorResponse } from '@angular/common/http';

export interface MockPlanningBriefSubmitPayload {
  readonly projectName: string;
  readonly primaryGoal: string;
  readonly audience: string;
  readonly mustHavePages: string;
  readonly brandNotes: string;
  readonly references: string;
  readonly deadline: string;
}

export interface MockPlanningBriefCreatedResponse {
  readonly id: string;
  readonly createdAt: string;
}

export interface MockPlanningBriefListItem {
  readonly id: string;
  readonly userId: string;
  readonly clientEmail: string;
  readonly projectName: string;
  readonly primaryGoal: string;
  readonly audience: string;
  readonly mustHavePages: string;
  readonly brandNotes: string;
  readonly references: string;
  readonly deadline: string;
  readonly createdAt: string;
}

export interface MockPlanningBriefListResponse {
  readonly briefs: readonly MockPlanningBriefListItem[];
}

interface BriefErrorMessageBody {
  readonly error: string;
}

function isBriefErrorMessageBody(value: object): value is BriefErrorMessageBody {
  return typeof Reflect.get(value, 'error') === 'string';
}

export function messageFromMockBriefHttpError(error: HttpErrorResponse): string {
  const body = error.error;
  if (typeof body === 'object' && body !== null && isBriefErrorMessageBody(body)) {
    return body.error;
  }
  return 'Something went wrong. Please try again.';
}
