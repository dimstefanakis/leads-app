import { useUser } from "@/lib/useUser";

function useHasProPlan() {
  const { user, subscription } = useUser();
  const hasProPlan = subscription?.prices?.products?.metadata?.plan == 'premium';
  console.log('user', hasProPlan, subscription);

  return hasProPlan;
}

export default useHasProPlan;
