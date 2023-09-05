'use client';

import { createContext, useEffect, useState, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  useUser as useSupaUser,
  useSessionContext,
  User
} from '@supabase/auth-helpers-react';
import type { Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { UserDetails, Subscription } from '../../types';

type UserContextType = {
  // accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
  // updateUser: () => any;
};

export const AuthContext = createContext<UserContextType | undefined>(undefined);

type AuthProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

const AuthProvider = ({ children, session }: AuthProviderProps) => {
  const supabase = createClientComponentClient();
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const user = session?.user ?? null;
  const router = useRouter();
  // const {
  //   session,
  //   isLoading: isLoadingUser,
  //   supabaseClient: supabase
  // } = useSessionContext();

  const getUserDetails = () => {
    return supabase.from('users').select('*').eq('id', user?.id).single();
  }
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .eq('user_id', user?.id)
      // .in('status', ['trialing', 'active'])
      .single();

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsloadingData(true);
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === 'fulfilled')
            // @ts-ignore
            setUserDetails(userDetailsPromise.value.data);

          if (subscriptionPromise.status === 'fulfilled')
            // @ts-ignore
            setSubscription(subscriptionPromise.value.data);

          setIsloadingData(false);
        }
      );
    } else if (!user && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user]);

  useEffect(() => {
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== session?.access_token) {
        router.refresh();
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [session, supabase, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        // session,
        userDetails,
        subscription,
        isLoading: isLoadingData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};


export default AuthProvider;