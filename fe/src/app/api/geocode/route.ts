import { type NextRequest, NextResponse } from 'next/server';

interface GeocodeResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isCoord?: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();

  // 1. Cek jika query adalah koordinat langsung (contoh: "-5.3812, 105.2567")
  const cleanCoord = query.replace(/^@/, '').trim();
  const matchCoord = cleanCoord.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (matchCoord) {
    const parsedLat = parseFloat(matchCoord[1]);
    const parsedLng = parseFloat(matchCoord[2]);
    if (
      !isNaN(parsedLat) &&
      !isNaN(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180
    ) {
      const coordResult: GeocodeResult = {
        id: `coord-${parsedLat}-${parsedLng}`,
        name: `Titik Koordinat: ${parsedLat.toFixed(6)}, ${parsedLng.toFixed(6)}`,
        address: 'Format koordinat Latitude, Longitude',
        lat: Number(parsedLat.toFixed(6)),
        lng: Number(parsedLng.toFixed(6)),
        isCoord: true,
      };
      return NextResponse.json({ results: [coordResult] });
    }
  }

  // 2. Query ke Photon Geocoder (OpenStreetMap engine dari Komoot tanpa parameter lang yang tidak didukung)
  try {
    let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
    if (lat && lon && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
      photonUrl += `&lat=${lat}&lon=${lon}`;
    }

    const res = await fetch(photonUrl, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const results: GeocodeResult[] = data.features.map((f: any, idx: number) => {
          const p = f.properties || {};
          const [lngVal, latVal] = f.geometry?.coordinates || [0, 0];
          const primaryName = p.name || p.street || p.city || 'Lokasi';
          const addressParts = [p.street, p.district, p.city, p.state, p.country]
            .filter(Boolean)
            .filter((part) => part !== primaryName);

          return {
            id: `photon-${p.osm_id || idx}-${latVal}-${lngVal}`,
            name: primaryName,
            address: addressParts.join(', ') || p.country || '',
            lat: Number(Number(latVal).toFixed(6)),
            lng: Number(Number(lngVal).toFixed(6)),
          };
        });

        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.error('Photon geocoder error:', err);
  }

  // 3. Fallback ke OpenStreetMap Nominatim dengan User-Agent resmi
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SIMAD-App/1.0 (internal-office-management)',
        'Accept-Language': 'id,en;q=0.8',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results: GeocodeResult[] = data.map((item: any, idx: number) => {
          const addr = item.address || {};
          const primaryName =
            item.name ||
            addr.road ||
            addr.suburb ||
            addr.city ||
            item.display_name.split(',')[0];

          return {
            id: `nominatim-${item.place_id || idx}`,
            name: primaryName,
            address: item.display_name,
            lat: Number(parseFloat(item.lat).toFixed(6)),
            lng: Number(parseFloat(item.lon).toFixed(6)),
          };
        });

        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.error('Nominatim fallback error:', err);
  }

  return NextResponse.json({ results: [] });
}
