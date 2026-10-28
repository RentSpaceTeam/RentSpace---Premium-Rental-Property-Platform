/**
 * Complete list of all 55 districts and major municipal cities across Madhya Pradesh, India.
 * RentSpace is dedicated exclusively to Madhya Pradesh.
 */
export const MP_CITIES: string[] = [
  'Agar Malwa',
  'Alirajpur',
  'Anuppur',
  'Ashoknagar',
  'Balaghat',
  'Barwani',
  'Betul',
  'Bhind',
  'Bhopal',
  'Burhanpur',
  'Chhatarpur',
  'Chhindwara',
  'Damoh',
  'Datia',
  'Dewas',
  'Dhar',
  'Dindori',
  'Guna',
  'Gwalior',
  'Harda',
  'Hoshangabad',
  'Indore',
  'Itarsi',
  'Jabalpur',
  'Jhabua',
  'Katni',
  'Khandwa',
  'Khargone',
  'Maihar',
  'Mandideep',
  'Mandla',
  'Mandsaur',
  'Mauganj',
  'Morena',
  'Nagda',
  'Narmadapuram',
  'Narsinghpur',
  'Neemuch',
  'Niwari',
  'Pandhurna',
  'Panna',
  'Pithampur',
  'Raisen',
  'Rajgarh',
  'Ratlam',
  'Rewa',
  'Sagar',
  'Sanawad',
  'Satna',
  'Sehore',
  'Sendhwa',
  'Seoni',
  'Shahdol',
  'Shajapur',
  'Sheopur',
  'Shivpuri',
  'Sidhi',
  'Singrauli',
  'Tikamgarh',
  'Ujjain',
  'Umaria',
  'Vidisha'
];

/**
 * Top major hubs in Madhya Pradesh for quick filter chips
 */
export const POPULAR_MP_CITIES: string[] = [
  'Indore',
  'Bhopal',
  'Jabalpur',
  'Gwalior',
  'Ujjain',
  'Sagar',
  'Dewas',
  'Satna',
  'Ratlam',
  'Rewa'
];

export const MP_STATE_NAME = 'Madhya Pradesh';

/**
 * Validates whether a city belongs to Madhya Pradesh.
 * Also tolerates legacy listings for backward compatibility.
 */
export function isMPCity(city: string): boolean {
  if (!city) return false;
  const normalized = city.trim().toLowerCase();
  return MP_CITIES.some((c) => c.toLowerCase() === normalized);
}
