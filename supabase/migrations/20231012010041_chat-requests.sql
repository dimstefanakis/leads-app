create table "public"."chat_requests" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid,
    "message" text
);


alter table "public"."chat_requests" enable row level security;

create table "public"."customers" (
    "id" uuid not null,
    "stripe_customer_id" text
);


alter table "public"."customers" enable row level security;

CREATE UNIQUE INDEX chat_requests_pkey ON public.chat_requests USING btree (id);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

alter table "public"."chat_requests" add constraint "chat_requests_pkey" PRIMARY KEY using index "chat_requests_pkey";

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."chat_requests" add constraint "chat_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_requests" validate constraint "chat_requests_user_id_fkey";

alter table "public"."customers" add constraint "customers_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_id_fkey";

create policy "Enable insert for authenticated users only"
on "public"."chat_requests"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable view for users based on user_id"
on "public"."chat_requests"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Enable read access for all users"
on "public"."prices"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."products"
as permissive
for select
to public
using (true);



