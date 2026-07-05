import type {
  TypeInvitationRequest,
  TypeInvitationResponse,
} from "@/features/invitation/types/invitation.type";
import { rootClient } from "@/shared/api/interceptors/root.interceptor";

class InvitationService {
  private readonly BASE_URL = "/invitation";

  async create(data: TypeInvitationRequest) {
    const response = await rootClient.post<TypeInvitationResponse>(
      `${this.BASE_URL}`,
      {
        json: data,
      },
    );

    return await response.json();
  }
}

export const invitationService = new InvitationService();
