import type { TypeDrinkResponse } from "@/features/invitation/types/drink.type";
import { rootClient } from "@/shared/api/interceptors/root.interceptor";

class DrinkService {
  private readonly BASE_URL = "/drink";

  async list() {
    const response = await rootClient<TypeDrinkResponse[]>(`${this.BASE_URL}`);
    return await response.json();
  }
}

export const drinkService = new DrinkService();
