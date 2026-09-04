/**
 * POST /api/profile — backend/src/modules/profile/profile.routes.ts +
 * profile.validation.ts. Auth required. The Profile model only stores a
 * `name`; there is no bio/about field on the backend, so the frontend only
 * asks for a name.
 */
export interface CreateProfilePayload {
  name: string;
}

export interface CreateProfileResponse {
  success: true;
  message: string;
  profile: {
    id: number;
    name: string;
    userId: number;
  };
}
