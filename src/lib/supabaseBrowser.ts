import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "../../types_db";

export const createBrowserClient = () => createClientComponentClient<Database>();