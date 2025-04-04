import { provinceMapByBranch } from "../../utils/common/province-map";
import { createAdhocCharge } from "../adhoc-chargeService";

export async function createAdhocChargeIfNeeded(
  formData: Record<string, any>,
  branchId: number,
  clientId: number
) {
  if (!formData.Ajouter_les_frais_d_inscription_) return;

  const branch = formData.branch?.trim();
  const province = formData.province_tutorat?.trim();
  const mapping = provinceMapByBranch[branch]?.[province];

  if (!mapping) return;

  const { id: categoryId, price } = mapping;
  const currentDate = new Date().toISOString();

  const adhocPayload = {
    client: clientId,
    category: categoryId,
    description: `Ouverture de dossier - Service de tutorat, ${province}`,
    date_occurred: currentDate,
    charge_client: price,
  };

  await createAdhocCharge(branchId, adhocPayload);
}
