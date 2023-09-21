CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create table "public"."chat_contexts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid,
    "name" text,
    "email" text,
    "area_of_expertise" text,
    "cold_email_example" text
);


alter table "public"."chat_contexts" enable row level security;

create table "public"."contacts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "data" jsonb,
    "columns" text[]
);


create table "public"."prices" (
    "id" text not null,
    "created_at" timestamp with time zone default now(),
    "product_id" text,
    "active" boolean,
    "description" text,
    "unit_amount" bigint,
    "currency" text,
    "type" text,
    "interval" text,
    "interval_count" integer,
    "trial_period_days" integer,
    "metadata" jsonb
);


alter table "public"."prices" enable row level security;

create table "public"."products" (
    "id" text not null,
    "created_at" timestamp with time zone default now(),
    "active" boolean,
    "name" text,
    "description" text,
    "image" text,
    "metadata" jsonb,
    "default_price" text
);


alter table "public"."products" enable row level security;

create table "public"."subscriptions" (
    "id" text not null,
    "created" timestamp with time zone default now(),
    "user_id" uuid,
    "status" text,
    "metadata" jsonb,
    "price_id" text,
    "quantity" integer,
    "cancel_at_period_end" boolean,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone
);


alter table "public"."subscriptions" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "full_name" text,
    "avatar_url" text,
    "billing_address" jsonb,
    "payment_method" jsonb,
    "email" text
);


alter table "public"."users" enable row level security;

create table "public"."workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "columns" text[],
    "contacts" jsonb[],
    "user_id" uuid
);


alter table "public"."workspaces" enable row level security;

CREATE UNIQUE INDEX chat_contexts_pkey ON public.chat_contexts USING btree (id);

CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id);

CREATE UNIQUE INDEX prices_pkey ON public.prices USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX workspace_pkey ON public.workspaces USING btree (id);

alter table "public"."chat_contexts" add constraint "chat_contexts_pkey" PRIMARY KEY using index "chat_contexts_pkey";

alter table "public"."contacts" add constraint "contacts_pkey" PRIMARY KEY using index "contacts_pkey";

alter table "public"."prices" add constraint "prices_pkey" PRIMARY KEY using index "prices_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."workspaces" add constraint "workspace_pkey" PRIMARY KEY using index "workspace_pkey";

alter table "public"."chat_contexts" add constraint "chat_contexts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_contexts" validate constraint "chat_contexts_user_id_fkey";

alter table "public"."prices" add constraint "prices_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;

alter table "public"."prices" validate constraint "prices_product_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_price_id_fkey" FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE SET NULL not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_price_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."workspaces" add constraint "workspaces_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."workspaces" validate constraint "workspaces_user_id_fkey";

set check_function_bodies = off;

create policy "Users have full access to their own chat context"
on "public"."chat_contexts"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Users can only see their own subscriptions"
on "public"."subscriptions"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Enable select for users based on user id"
on "public"."users"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Enable read access for all users"
on "public"."workspaces"
as permissive
for select
to public
using (true);


create policy "Enable update access for all users"
on "public"."workspaces"
as permissive
for update
to public
with check (true);


create policy "Enable update for users based on id"
on "public"."workspaces"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Insert access to everyone"
on "public"."workspaces"
as permissive
for insert
to public
with check (true);



create policy "Every one can download 1pn9ljn_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'contacts'::text));


create policy "public_upload 1pn9ljn_0"
on "storage"."objects"
as permissive
for insert
to anon, authenticated
with check ((bucket_id = 'contacts'::text));



