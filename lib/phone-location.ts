import { parsePhoneNumberFromString } from 'libphonenumber-js'
import type { ApproximateLocation } from '@/components/approximate-location-map'
import countries from 'world-countries'

const countryCentroids = new Map(countries.map(country => [country.cca2, {
  name: country.translations.por?.common ?? country.name.common,
  latitude: country.latlng[0],
  longitude: country.latlng[1],
}]))

const brazilianDdds: Record<string, Omit<ApproximateLocation, 'source'>> = {
  '11': { city: 'São Paulo', state: 'SP', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  '21': { city: 'Rio de Janeiro', state: 'RJ', country: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
  '31': { city: 'Belo Horizonte', state: 'MG', country: 'Brazil', latitude: -19.9167, longitude: -43.9345 },
  '32': { city: 'Juiz de Fora', state: 'MG', country: 'Brazil', latitude: -21.7642, longitude: -43.3503 },
  '34': { city: 'Uberlândia', state: 'MG', country: 'Brazil', latitude: -18.9186, longitude: -48.2772 },
  '35': { city: 'Poços de Caldas', state: 'MG', country: 'Brazil', latitude: -21.7878, longitude: -46.5614 },
  '37': { city: 'Divinópolis', state: 'MG', country: 'Brazil', latitude: -20.1389, longitude: -44.8844 },
  '41': { city: 'Curitiba', state: 'PR', country: 'Brazil', latitude: -25.4284, longitude: -49.2733 },
  '51': { city: 'Porto Alegre', state: 'RS', country: 'Brazil', latitude: -30.0346, longitude: -51.2177 },
  '61': { city: 'Brasília', state: 'DF', country: 'Brazil', latitude: -15.7939, longitude: -47.8828 },
  '71': { city: 'Salvador', state: 'BA', country: 'Brazil', latitude: -12.9777, longitude: -38.5016 },
  '81': { city: 'Recife', state: 'PE', country: 'Brazil', latitude: -8.0476, longitude: -34.877 },
  '85': { city: 'Fortaleza', state: 'CE', country: 'Brazil', latitude: -3.7319, longitude: -38.5267 },
  '91': { city: 'Belém', state: 'PA', country: 'Brazil', latitude: -1.4558, longitude: -48.4902 },
}

export function getApproximateLocation(phone: string): ApproximateLocation | null {
  const parsed = parsePhoneNumberFromString(phone, 'BR')
  if (!parsed) return null
  const national = parsed.nationalNumber
  const ddd = parsed.country === 'BR' ? national.slice(0, 2) : ''
  const match = brazilianDdds[ddd]
  if (match) return { ...match, source: 'Regional code' }

  if (!parsed.country) return null
  const country = countryCentroids.get(parsed.country)
  if (!country) return null

  return {
    city: country.name,
    state: 'Approximate national location',
    country: country.name,
    latitude: country.latitude,
    longitude: country.longitude,
    source: 'Country code',
  }
}
