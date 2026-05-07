// Edge Function untuk Auto-Dispatch
// Deploy ke Supabase dengan: supabase functions deploy auto-dispatch

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AvailableDriver {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  currentLocation: {
    lat: number;
    lng: number;
  };
  status: string;
}

interface MatchingScore {
  driverId: string;
  score: number;
  distance: number;
  rating: number;
  responseTime: number;
}

/**
 * Haversine formula untuk menghitung distance antar 2 coordinates
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalisasi score (0-100)
 */
function normalizeScore(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Score a driver untuk potential match
 * Total score: distance(40%) + rating(40%) + responseTime(20%)
 */
function scoreDriver(
  driver: AvailableDriver,
  distance: number,
  avgDistance: number,
  maxDistance: number,
  avgRating: number,
  maxRating: number,
  responseTime: number
): MatchingScore {
  // Distance score (inverted - lebih dekat = score lebih tinggi)
  const distanceScore = Math.max(0, 100 - (distance / maxDistance) * 100);

  // Rating score (0-5 stars → 0-100)
  const ratingScore = (driver.rating / 5) * 100;

  // Response time score (inverted - lebih cepat = score lebih tinggi)
  const responseTimeScore = Math.max(0, 100 - (responseTime / 120) * 100); // Max 120 seconds

  // Weighted total
  const totalScore =
    distanceScore * 0.4 + ratingScore * 0.4 + responseTimeScore * 0.2;

  return {
    driverId: driver.id,
    score: Math.round(totalScore),
    distance,
    rating: driver.rating,
    responseTime,
  };
}

/**
 * Fetch available drivers untuk region tertentu
 */
async function getAvailableDrivers(
  regionId: string,
  bookingPickupLat: number,
  bookingPickupLng: number
): Promise<AvailableDriver[]> {
  // Get drivers di region yang online, belum ada active trip, dan verified
  const { data: drivers, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      role,
      driver_locations(latitude, longitude, status),
      driver_verifications(overall_status)
    `
    )
    .eq("region_id", regionId)
    .in("role", ["driver", "photographer", "guide"])
    .eq("is_active", true)
    .eq("driver_locations.status", "standby")
    .eq("driver_verifications.overall_status", "approved");

  if (error) throw error;

  // Get ratings untuk each driver
  const { data: ratings } = await supabase
    .from("reviews")
    .select("driver_id, driver_rating")
    .eq("is_published", true);

  const ratingMap = new Map<string, number[]>();
  (ratings || []).forEach((r: any) => {
    if (!ratingMap.has(r.driver_id)) {
      ratingMap.set(r.driver_id, []);
    }
    ratingMap.get(r.driver_id)?.push(r.driver_rating);
  });

  // Transform to AvailableDriver format
  return (drivers || [])
    .filter((d: any) => d.driver_locations && d.driver_locations[0])
    .map((driver: any) => {
      const ratingsArray = ratingMap.get(driver.id) || [];
      const avgRating =
        ratingsArray.length > 0
          ? ratingsArray.reduce((a: number, b: number) => a + b, 0) /
            ratingsArray.length
          : 3.5;

      return {
        id: driver.id,
        name: driver.full_name,
        rating: avgRating,
        totalTrips: ratingsArray.length,
        currentLocation: {
          lat: parseFloat(driver.driver_locations[0].latitude),
          lng: parseFloat(driver.driver_locations[0].longitude),
        },
        status: driver.driver_locations[0].status,
      };
    });
}

/**
 * Main auto-dispatch function
 */
async function autoDispatchBooking(bookingId: string): Promise<{
  success: boolean;
  assignedDriverId?: string;
  message: string;
}> {
  try {
    // 1. Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        region_id,
        pickup_location,
        pickup_lat,
        pickup_lng,
        pax_count,
        trip_date,
        pickup_time,
        status
      `
      )
      .eq("id", bookingId)
      .eq("status", "confirmed")
      .single();

    if (bookingError || !booking) {
      return {
        success: false,
        message: "Booking not found or not in confirmed status",
      };
    }

    // 2. Get available drivers dalam region
    const availableDrivers = await getAvailableDrivers(
      booking.region_id,
      booking.pickup_lat || 0,
      booking.pickup_lng || 0
    );

    if (availableDrivers.length === 0) {
      return {
        success: false,
        message: "No available drivers found",
      };
    }

    // 3. Calculate scores untuk each driver
    const scores = availableDrivers.map((driver) => {
      const distance = calculateDistance(
        booking.pickup_lat || 0,
        booking.pickup_lng || 0,
        driver.currentLocation.lat,
        driver.currentLocation.lng
      );

      return scoreDriver(
        driver,
        distance,
        5, // average distance
        20, // max distance (5 km buffer)
        4.0, // average rating
        5.0, // max rating
        Math.random() * 60 + 10 // random response time 10-70 seconds
      );
    });

    // 4. Sort by score (highest first) dan ambil top 3
    const topCandidates = scores.sort((a, b) => b.score - a.score).slice(0, 3);

    if (topCandidates.length === 0) {
      return {
        success: false,
        message: "No suitable drivers found",
      };
    }

    // 5. Try to assign to top candidate
    const assignedDriver = topCandidates[0];

    // Update booking dengan driver assignment
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        driver_id: assignedDriver.driverId,
        status: "assigned",
      })
      .eq("id", bookingId);

    if (updateError) {
      return {
        success: false,
        message: `Failed to assign driver: ${updateError.message}`,
      };
    }

    // 6. Create notification untuk driver
    await supabase.from("notifications").insert({
      user_id: assignedDriver.driverId,
      title: "New Trip Assigned",
      body: `You have been assigned a new trip. Check your app for details.`,
      type: "booking",
      data: {
        booking_id: bookingId,
      },
      channel: "push",
    });

    console.log(
      `✅ Successfully assigned booking ${bookingId} to driver ${assignedDriver.driverId} (score: ${assignedDriver.score})`
    );

    return {
      success: true,
      assignedDriverId: assignedDriver.driverId,
      message: `Auto-dispatched to ${
        availableDrivers.find((d) => d.id === assignedDriver.driverId)?.name
      }`,
    };
  } catch (error) {
    console.error("Auto-dispatch error:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Cron trigger: Process unassigned bookings
 * Call this setiap 30 detik via Vercel Cron
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get all confirmed but unassigned bookings
    const { data: unassignedBookings, error } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "confirmed")
      .is("driver_id", null)
      .limit(10);

    if (error) throw error;

    const results = [];

    // Process each booking
    for (const booking of unassignedBookings || []) {
      const result = await autoDispatchBooking(booking.id);
      results.push(result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
