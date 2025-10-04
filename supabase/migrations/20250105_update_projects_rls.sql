-- Mise à jour des politiques RLS pour la table projects
-- Assure-toi que la table projects existe et a une colonne user_id

-- Vérifier si la colonne user_id existe, sinon l'ajouter
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Créer un index sur user_id si il n'existe pas
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- Activer RLS sur la table projects si ce n'est pas déjà fait
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow owner read" ON public.projects;
DROP POLICY IF EXISTS "Allow owner insert" ON public.projects;
DROP POLICY IF EXISTS "Allow owner update" ON public.projects;
DROP POLICY IF EXISTS "Allow owner delete" ON public.projects;

-- Politiques RLS pour la table projects
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour auto-remplir user_id lors de l'insertion
CREATE OR REPLACE FUNCTION public.set_projects_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trg_set_projects_user_id ON public.projects;

-- Créer le nouveau trigger
CREATE TRIGGER trg_set_projects_user_id
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_projects_user_id();
