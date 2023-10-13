import { useUser } from "@/lib/useUser";

function useHasProPlan() {
  const { user, subscription } = useUser();

  const hasProPlan = subscription?.prices?.products?.metadata?.plan == 'premium';

  return hasProPlan;
}

export default useHasProPlan;
