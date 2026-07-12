import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type Event = Tables<"events">;

export function useEvents(search?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["events", user?.id, search],
    queryFn: async () => {
      let query = supabase
      .from("events")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useEventBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["event-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("slug", slug!).eq("status", "live").single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });
}

export function useOwnedEventBySlug(slug: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owned-event-slug", user?.id, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug!)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!user && !!slug,
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useCreateEvent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      event_date?: string;
      event_end_date?: string;
      timezone?: string;
      event_type?: string;
      template?: string;
      location_type?: string;
      location_value?: string;
      ticket_price?: number;
      requires_approval?: boolean;
      capacity?: number;
      status?: "draft" | "live" | "past";
    }) => {
      const slug = generateSlug(input.name);

    console.error("Current user:", user);

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...input,
        slug,
        user_id: user!.id,
        status: (input.status || "live") as "draft" | "live" | "past",
      })
      .select()
      .single();

    console.log("Insert error:", error);

    if (error) throw error;
      return data as Event;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"events"> & { id: string }) => {
      const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Event;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", data.id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}
