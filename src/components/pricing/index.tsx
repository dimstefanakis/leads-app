import { Button } from "../ui/button";
import { CheckIcon } from "lucide-react"

function Pricing() {
  return (
    <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
      <div className="grid gap-6">
        <h3 className="text-xl font-bold sm:text-2xl">
          What's included
        </h3>
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex items-center">
            <CheckIcon className="mr-2" />
            <span>Access to up to 10 AI tools of your choice</span>
          </li>
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
        <Button>
          Get Started
        </Button>
      </div>
    </div>
  )
}

export default Pricing;
