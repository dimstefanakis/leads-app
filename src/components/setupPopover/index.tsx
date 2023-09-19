import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { useUser } from "@/lib/useUser"

// component which setups data needed for the email chatbot
// will incluse stuff like:
// - Users name or company name
// - Users email
// - Users area of expertise
// - An example of a cold email they have sent before

type Inputs = {
  name: string,
  email: string,
  expertise: string,
  exampleEmail: string,
}

export function SetupPopover() {
  const { user, userChatContext } = useUser();
  const form = useForm<Inputs>({
    defaultValues: {
      name: userChatContext?.name || '',
      email: userChatContext?.email || '',
      expertise: userChatContext?.area_of_expertise || '',
      exampleEmail: userChatContext?.cold_email_example || '',
    }
  })

  async function onSubmit(values: Inputs) {
    let response = await fetch('/api/update-chat-context', {
      method: 'POST',
      body: JSON.stringify({
        name: values.name,
        // email: values.email,
        expertise: values.expertise,
        cold_email_example: values.exampleEmail,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-3">Setup</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Setup</DialogTitle>
          <DialogDescription>
            Please fill out the following information to help the chatbot
            generate emails for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="John Doe"
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder=""
                      autoComplete="off"
                    />

                  </FormControl>
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Area of expertise</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder=""
                      autoComplete="off"
                    />

                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exampleEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Example of a cold email you have sent before</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder=""
                      autoComplete="off"
                      rows={12}
                    />

                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )

}