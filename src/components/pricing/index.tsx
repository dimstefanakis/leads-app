import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { CheckIcon } from "lucide-react"
import { getStripe } from "@/utils/stripe-client";
import { getActiveProductsWithPrices } from '@/utils/supabase-client';
import { ProductWithPrice } from "../../../types";
import { useUser } from "@/lib/useUser";

function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const { user } = useUser();

  useEffect(() => {
    async function getProducts() {
      const data = await getActiveProductsWithPrices();
      setProducts(data);
    }
    getProducts();
  }, []);

  const premiumPlan = products.find(
    (product) =>
      // product?.metadata?.live == 'true' &&
      product?.metadata?.type == 'premium'
  );

  const premiumPrice = premiumPlan?.prices?.find(
    (price) => price.id === premiumPlan.default_price
  );

  async function onClick() {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (premiumPrice) {
      setLoading(true);
      const response = await fetch(
        '/api/create-subscription-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            { price: { id: premiumPrice.id } }
          )
        }
      );
      console.log('response', response);
      const { sessionId } = await response.json();
      const stripe = await getStripe();
      setLoading(false);
      stripe?.redirectToCheckout({ sessionId });
    }
  }

  return (
    <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
      <div className="grid gap-6">
        <h3 className="text-xl font-bold sm:text-2xl">
          What's included
        </h3>
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {/* <li className="flex items-center">
            <CheckIcon className="mr-2" />
            <span>Access to up to 10 AI tools of your choice</span>
          </li> */}
          <li className="flex items-center">
            <CheckIcon className="mr-2" />
            <span>Access to GPT-4</span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="mr-2" />
            <span>Up to 400 requests per month</span>
          </li>

        </ul>
      </div>
      <div className="flex flex-col gap-4 text-center">
        <div>
          <h4 className="text-7xl font-bold">
            $19
          </h4>
          <p className="text-sm font-medium text-muted-foreground">
            Billed Monthly
          </p>
        </div>
        <Button onClick={onClick} disabled={loading}>
          Get Started
          {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
      </div>
    </div>
  )
}

export default Pricing;
