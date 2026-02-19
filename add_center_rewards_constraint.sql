-- Add unique constraint to center_rewards to prevent duplicate rewards for same student
ALTER TABLE public.center_rewards
ADD CONSTRAINT center_rewards_new_student_id_key UNIQUE (new_student_id);

-- Also ensuring payment_id is unique is good practice
ALTER TABLE public.center_rewards
ADD CONSTRAINT center_rewards_payment_id_key UNIQUE (payment_id);
