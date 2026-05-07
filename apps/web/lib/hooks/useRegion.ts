import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Fetch all regions or single region
 */
export function useRegions(regionId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['regions', regionId],
    queryFn: async () => {
      let query = supabase
        .from('regions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (regionId) {
        query = query.eq('id', regionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch packages for a region
 */
export function usePackagesByRegion(regionId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['packages', regionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('region_id', regionId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!regionId,
  });
}

/**
 * Fetch single package with full details
 */
export function usePackage(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['package', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          region:regions(id, name, slug, timezone),
          reviews(
            id,
            rating,
            driver_rating,
            photo_rating,
            comment,
            created_at,
            client:profiles(full_name, avatar_url)
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch package rating stats
 */
export function usePackageRating(packageId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['packageRating', packageId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_package_rating', {
        p_package_id: packageId,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!packageId,
  });
}

/**
 * Search packages across all regions
 */
export function useSearchPackages(query: string, destination?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['searchPackages', query, destination],
    queryFn: async () => {
      let qb = supabase
        .from('packages')
        .select(`
          *,
          region:regions(name, slug)
        `)
        .eq('is_active', true)
        .eq('is_featured', false)
        .order('created_at', { ascending: false });

      if (query) {
        qb = qb.or(`name.ilike.%${query}%, description.ilike.%${query}%`);
      }

      if (destination) {
        qb = qb.ilike('destination', `%${destination}%`);
      }

      const { data, error } = await qb;
      if (error) throw error;
      return data;
    },
    enabled: query.length > 0 || !!destination,
  });
}
