import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user!.id,
          full_name: user?.email?.split("@")[0] || "",
          social_links: [],
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newProfile as Profile;
    }

    return data as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: TablesUpdate<"profiles">) => {
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", user!.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
