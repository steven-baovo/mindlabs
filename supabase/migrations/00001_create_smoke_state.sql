-- Create smoke_state table
CREATE TABLE IF NOT EXISTS public.smoke_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    cravings_defeated INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.smoke_state ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own smoke state"
    ON public.smoke_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own smoke state"
    ON public.smoke_state FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smoke state"
    ON public.smoke_state FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_smoke_state_updated_at
    BEFORE UPDATE ON public.smoke_state
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
