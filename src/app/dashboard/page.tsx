'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/useUser"
import Navbar from "@/components/navbar"
import useHasProPlan from "@/hooks/useHasProPlan"

function Dashboard() {
  const router = useRouter()
  const { user, subscription } = useUser()
  const hasProPlan = useHasProPlan()
  const [requestCount, setRequestCount] = useState(0)

  async function cancelSubscription() {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // toast({
    //   title: 'Subscription Cancelled',
    //   description:
    //     'Your subscription has been cancelled. You can still use your current plan until the end of your billing cycle.',
    //   status: 'success',
    //   duration: 500000,
    //   isClosable: true
    // });
  }

  async function reactivateSubscription() {
    const response = await fetch('/api/reactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // toast({
    //   title: 'Subscription Reactivated',
    //   description: 'Your subscription has been reactivated.',
    //   status: 'success',
    //   duration: 5000,
    //   isClosable: true
    // });
  }

  useEffect(() => {
    async function getRequests() {
      const response = await fetch(
        '/api/get-request-count',
        {
          method: 'GET',
        }
      );
      const data = await response.json();
      setRequestCount(data)
    }
    getRequests()
  }, [])

  return (
    <>
    <Navbar noDash/>
    <div className="flex w-full justify-center">
      <div className="flex max-w-3xl w-full mx-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-6 mt-10">Dashboard</h1>
          <h1 className="text-xl font-semibold">Monthly requests</h1>
          <p>
            {requestCount} / {hasProPlan ? '400' : '400'}
          </p>
          <span className="text-sm text-gray-500">
            Your request limit resets on the 1st of every month.
          </span>
          <h1 className="text-xl font-semibold mt-8">Your Plan</h1>
          <p>
            {hasProPlan ? 'Pro' : 'Free'}
          </p>
          <span className="text-sm text-gray-500 mb-4">
            {hasProPlan ? 'You are on the Pro plan.' : 'You are on the Free plan.'}
          </span>
          {subscription ? (
            subscription?.status === 'active' &&
              !subscription.cancel_at_period_end ? (
              <Button onClick={cancelSubscription}>
                Cancel
              </Button>
            ) : subscription?.status === 'canceled' ||
              subscription?.status === 'unpaid' ? (
              <Button onClick={() => {
                router.push('/')
              }}>
                Upgrade
              </Button>
            ) : (
              subscription?.cancel_at_period_end && (
                //@ts-ignore
                <Button ml={4} onClick={reactivateSubscription}>
                  Reactivate
                </Button>
              )
            )
          ) : (
            <Button onClick={() => {
              router.push('/')
            }}>
              Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
    </>

  )
}

export default Dashboard