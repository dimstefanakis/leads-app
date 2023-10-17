'use client';

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from "@/lib/useUser"

const views = [
  'sign_in',
  'sign_up',
  'forgotten_password',
  'magic_link',
  'update_password'
];

type Views = typeof views[number];


function SignIn() {
  const router = useRouter();
  const form = useForm()
  const [view, setView] = useState<Views>('sign_up');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const supabase = createClientComponentClient();
  const { user } = useUser();

  function onSubmit(values: any) {
    form.clearErrors();
    if (view == 'sign_in') {
      handleLogin();
    } else {
      handleSignUp();
    }
  }

  async function handleSignUp() {
    setLoading(true);
    const response = await fetch(
      '/auth/sign-up',
      {
        body: JSON.stringify({
          email: form.watch('email'),
          password: form.watch('password')
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    const data = await response.json()
    if (data.error) {
      form.setError('invalid_credentials', { message: data.error.message });
      setLoading(false);
    } else {
      handleLogin();
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: form.watch('email'),
      password: form.watch('password')
    });
    router.refresh()
    setLoading(false);

    if (error) {
      form.setError('invalid_credentials', { message: error.message });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="flex flex-col max-w-sm w-full space-y-8">
          <div>
            <h2 className="mt-6 mb-8 text-3xl font-extrabold">
              {view == 'sign_in' ? 'Sign in' : 'Create an account'}
            </h2>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name} className="text-start block">Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name} className="text-start block">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    onClick={() => setView('forgotten_password')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div> */}
              <div className="w-full">
                <p className="text-red-600 mb-3">
                  {/* @ts-ignore */}
                  {form.formState.errors.invalid_credentials?.message}
                </p>

                <Button className="w-full" disabled={loading} onClick={() => {
                  form.clearErrors();
                  form.handleSubmit(onSubmit)
                }}>
                  {view === 'sign_in' ? 'Sign in' : 'Sign up'}
                  {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="w-full text-center">
                    {view === 'sign_in' && (
                      <div
                        className="text-md"
                      >
                        Dont have an account?
                        <span style={{ color: '#3182ce', cursor: 'pointer' }} onClick={() => setView('sign_up')}
                          className="w-full font-medium ml-1 text-md hover:text-indigo-500">
                          Sign up
                        </span>
                      </div>
                    )}
                    {view === 'sign_up' && (
                      <div
                        className="text-md"
                      >
                        Already have an account?
                        <span style={{ color: '#3182ce', cursor: 'pointer' }} onClick={() => setView('sign_in')}
                          className="w-full font-medium ml-1 text-md hover:text-indigo-500">
                          Login
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default SignIn