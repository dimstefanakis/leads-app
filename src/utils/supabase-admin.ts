import { createClient } from '@supabase/supabase-js';
import { stripe } from './stripe';
import { toDateTime } from './helpers';
import { Customer, UserDetails, Price, Product } from '../../types';
import type { Database } from '../../types_db';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin priviliges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
    default_price: product.default_price as string
  };

  const { error } = await supabaseAdmin.from('products').upsert([productData]);
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata
  };

  const { error } = await supabaseAdmin.from('prices').upsert([priceData]);
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', uuid)
    .single();
  if (error || !data?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
    {
      metadata: {
        supabaseUUID: uuid
      }
    };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await supabaseAdmin
      .from('customers')
      .insert([{ id: uuid, stripe_customer_id: customer.id }]);
    if (supabaseError) throw supabaseError;
    console.log(`New customer created and inserted for ${uuid}.`);
    return customer.id;
  }
  return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (error) throw error;
};

const enableUnlimitedQuestionsStatus = async (customerId: string) => {
  // get user
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;
  const { id: uuid } = customerData!;
  // get user
  const { data: userData, error: noUserError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', uuid)
    .single();
  if (noUserError) throw noUserError;

  const { id: userId } = userData!;
  // update user
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ has_unlimited_questions_plan: true })
    .eq('id', userId);
  if (updateError) throw updateError;
};
const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: Database['public']['Tables']['subscriptions']['Insert'] =
  {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    // @ts-ignore
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

const retrieveUsersSurveysAndSubmissionCount = async () => {
  const { data: surveys, error: usersError } = await supabaseAdmin
    .from('surveys')
    .select('id, created_at, data, submissions(count), user(id, email)')
    .order('created_at', {
      ascending: false
    });
  if (usersError) throw usersError;
  return surveys;
};

const cancelSubscription = async (userId: string) => {
  //  get subscription id
  const { data: subscriptionData, error: noSubscriptionError } =
    await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
  if (noSubscriptionError) throw noSubscriptionError;

  const subscriptionId = subscriptionData!.id;
  console.log(
    `Cancelling subscription [${subscriptionId}] for user [${userId}]`
  );
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
  return subscription;
};

const reactivateSubscription = async (userId: string) => {
  //  get subscription id
  const { data: subscriptionData, error: noSubscriptionError } =
    await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
  if (noSubscriptionError) throw noSubscriptionError;

  const subscriptionId = subscriptionData!.id;
  console.log(
    `Reactivating subscription [${subscriptionId}] for user [${userId}]`
  );
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
  return subscription;
};

const retrieveAdminData = async () => {
  const { data: users, error: usersError } = await supabaseAdmin
    .from('dashboard')
    .select('*');
  if (usersError) throw usersError;
  return users;
};

const createSurveyRecord = async (
  survey: any,
  external_link: string | null | undefined,
  utm_survey: string | null | undefined,
  user: Database['public']['Tables']['users']['Row']
) => {
  // TODO: validate utm_survey is a valid survey id
  const user_id = user.id;
  const surveyData: Database['public']['Tables']['surveys']['Insert'] = {
    id: uuidv4(),
    user: user_id,
    data: survey,
    external_link: external_link,
    name: survey.surveyName,
    utm_survey: utm_survey,
    responses_needed: survey.responsesNeeded,
    status: 'In Review'
  };
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .insert([surveyData])
    .select();
  if (error) throw error;
  console.log(`Survey inserted for user [${user_id}].`);
  return data;
};

const editSurveyRecord = async (
  survey: any,
  surveyId: string,
  user: Database['public']['Tables']['users']['Row']
) => {
  const user_id = user.id;
  const surveyData: Database['public']['Tables']['surveys']['Update'] = {
    data: survey,
    name: survey.surveyName,
    responses_needed: survey.responsesNeeded,
    status: 'In Review'
  };
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .update(surveyData)
    .eq('id', surveyId)
    .select()
    .single();
  if (error) throw error;
  console.log(`Survey updated for user [${user_id}].`);
  return data;
};

const deleteSurveyRecord = async (surveyId: string) => {
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .delete()
    .eq('id', surveyId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const duplicateSurveyRecord = async (surveyId: string, profileId: string) => {
  const { data: surveyData, error: surveyError } = await supabaseAdmin
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();
  if (surveyError) throw surveyError;
  const survey = surveyData!;
  const surveyCopy = { ...survey, id: uuidv4() };
  surveyCopy.created_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .insert([surveyCopy])
    .select()
    .single();
  if (error) throw error;
  console.log(`Survey copied for user [${profileId}].`);
  return data;
};

const getUserProfile = async (user_id: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();
  if (error) throw error;
  return data;
};

const retrieveAudiences = async () => {
  const { data, error } = await supabaseAdmin.from('audiences').select('*');
  if (error) throw error;
  return data;
};

const retrieveMySurveys = async (user_id: string) => {
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .select('*, submissions(count)')
    .eq('user', user_id);
  if (error) throw error;
  return data;
};

const retrieveAllSurveys = async () => {
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .select('*, submissions(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const retrieveSurvey = async (survey_id: string) => {
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .select('*, submissions(count)')
    .eq('id', survey_id)
    .single();
  if (error) throw error;
  return data;
};

const createUseCaseRecord = async (id: string, use_case: string) => {
  const { data, error } = await supabaseAdmin
    .from('use_cases')
    .upsert([{ use_case: use_case, id: id }]);
  if (error) throw error;
  return data;
};

const tieUserToUseCase = async (user_id: string, use_case: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ use_case })
    .eq('id', user_id);
  if (error) throw error;
  return data;
};

const createSurveyPromptRecord = async (prompt: string) => {
  const { data, error } = await supabaseAdmin
    .from('survey_prompts')
    .insert([{ prompt: prompt }]);
  if (error) throw error;
  return data;
};

const createSubmission = async (
  payload: Database['public']['Tables']['submissions']['Insert']
) => {
  const { error } = await supabaseAdmin.from('submissions').insert([payload]);

  if (error) {
    console.log(error.message);
  }
};

const createEmailCaptureRecord = async (
  payload: Database['public']['Tables']['create_form_email_captures']['Insert']
) => {
  const { error } = await supabaseAdmin
    .from('create_form_email_captures')
    .insert([payload]);

  if (error) {
    console.log(error.message);
  }
};

const retrieveResponsesCount = async (survey_id: string) => {
  const { data, error } = await supabaseAdmin
    .from('surveys')
    .select(`submissions(count)`)
    .eq('id', survey_id)
    .single();
  if (error) throw error;
  return data;
};

const retrieveResponses = async (survey_id: string) => {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('data, created_at')
    .eq('survey', survey_id);

  const survey = await supabaseAdmin
    .from('surveys')
    .select('data, name')
    .eq('id', survey_id)
    .single();
  if (error) throw error;
  return { submissions: data, survey };
};

export {
  upsertProductRecord,
  cancelSubscription,
  reactivateSubscription,
  upsertPriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  createSurveyRecord,
  duplicateSurveyRecord,
  editSurveyRecord,
  deleteSurveyRecord,
  getUserProfile,
  retrieveAudiences,
  retrieveMySurveys,
  createUseCaseRecord,
  tieUserToUseCase,
  createSurveyPromptRecord,
  retrieveSurvey,
  createSubmission,
  retrieveResponsesCount,
  retrieveResponses,
  retrieveUsersSurveysAndSubmissionCount,
  retrieveAllSurveys,
  retrieveAdminData,
  createEmailCaptureRecord,
  enableUnlimitedQuestionsStatus
};
