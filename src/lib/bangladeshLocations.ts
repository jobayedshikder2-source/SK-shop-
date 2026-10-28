export interface DistrictInfo {
  name: string;
  nameBn: string;
  division: string;
  isDhakaCity: boolean;
}

export const BANGLADESH_DIVISIONS = [
  { id: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'chattogram', name: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'sylhet', name: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'khulna', name: 'Khulna', nameBn: 'খুলনা' },
  { id: 'barishal', name: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'rangpur', name: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Dhaka Division
  { name: 'Dhaka City', nameBn: 'ঢাকা সিটি', division: 'Dhaka', isDhakaCity: true },
  { name: 'Dhaka (Suburbs/Savar/Keraniganj)', nameBn: 'ঢাকা (উপশহর/সাভার/কেরানীগঞ্জ)', division: 'Dhaka', isDhakaCity: false },
  { name: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka', isDhakaCity: false },
  { name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka', isDhakaCity: false },
  { name: 'Narsingdi', nameBn: 'নরসিংদী', division: 'Dhaka', isDhakaCity: false },
  { name: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka', isDhakaCity: false },
  { name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', division: 'Dhaka', isDhakaCity: false },
  { name: 'Manikganj', nameBn: 'মানিকগঞ্জ', division: 'Dhaka', isDhakaCity: false },
  { name: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', division: 'Dhaka', isDhakaCity: false },
  { name: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka', isDhakaCity: false },
  { name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', division: 'Dhaka', isDhakaCity: false },
  { name: 'Madaripur', nameBn: 'মাদারীপুর', division: 'Dhaka', isDhakaCity: false },
  { name: 'Rajbari', nameBn: 'রাজবাড়ী', division: 'Dhaka', isDhakaCity: false },
  { name: 'Shariatpur', nameBn: 'শরীয়তপুর', division: 'Dhaka', isDhakaCity: false },

  // Chattogram Division
  { name: 'Chattogram', nameBn: 'চট্টগ্রাম', division: 'Chattogram', isDhakaCity: false },
  { name: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chattogram', isDhakaCity: false },
  { name: 'Cumilla', nameBn: 'কুমিল্লা', division: 'Chattogram', isDhakaCity: false },
  { name: 'Feni', nameBn: 'ফেনী', division: 'Chattogram', isDhakaCity: false },
  { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', isDhakaCity: false },
  { name: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chattogram', isDhakaCity: false },
  { name: 'Chandpur', nameBn: 'চাঁদপুর', division: 'Chattogram', isDhakaCity: false },
  { name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', division: 'Chattogram', isDhakaCity: false },
  { name: 'Rangamati', nameBn: 'রাঙ্গামাটি', division: 'Chattogram', isDhakaCity: false },
  { name: 'Bandarban', nameBn: 'বান্দরবান', division: 'Chattogram', isDhakaCity: false },
  { name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', division: 'Chattogram', isDhakaCity: false },

  // Sylhet Division
  { name: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet', isDhakaCity: false },
  { name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', division: 'Sylhet', isDhakaCity: false },
  { name: 'Habiganj', nameBn: 'হবিগঞ্জ', division: 'Sylhet', isDhakaCity: false },
  { name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', division: 'Sylhet', isDhakaCity: false },

  // Rajshahi Division
  { name: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Bogura', nameBn: 'বগুড়া', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Naogaon', nameBn: 'নওগাঁ', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Natore', nameBn: 'নাটোর', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', isDhakaCity: false },
  { name: 'Joypurhat', nameBn: 'জয়পুরহাট', division: 'Rajshahi', isDhakaCity: false },

  // Khulna Division
  { name: 'Khulna', nameBn: 'খুলনা', division: 'Khulna', isDhakaCity: false },
  { name: 'Jashore', nameBn: 'যশোর', division: 'Khulna', isDhakaCity: false },
  { name: 'Kushtia', nameBn: 'কুষ্টিয়া', division: 'Khulna', isDhakaCity: false },
  { name: 'Satkhira', nameBn: 'সাতক্ষীরা', division: 'Khulna', isDhakaCity: false },
  { name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', division: 'Khulna', isDhakaCity: false },
  { name: 'Bagerhat', nameBn: 'বাগেরহাট', division: 'Khulna', isDhakaCity: false },
  { name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', division: 'Khulna', isDhakaCity: false },
  { name: 'Magura', nameBn: 'মাগুরা', division: 'Khulna', isDhakaCity: false },
  { name: 'Meherpur', nameBn: 'মেহেরপুর', division: 'Khulna', isDhakaCity: false },
  { name: 'Narail', nameBn: 'নড়াইল', division: 'Khulna', isDhakaCity: false },

  // Barishal Division
  { name: 'Barishal', nameBn: 'বরিশাল', division: 'Barishal', isDhakaCity: false },
  { name: 'Patuakhali', nameBn: 'পটুয়াখালী', division: 'Barishal', isDhakaCity: false },
  { name: 'Bhola', nameBn: 'ভোলা', division: 'Barishal', isDhakaCity: false },
  { name: 'Pirojpur', nameBn: 'পিরোজপুর', division: 'Barishal', isDhakaCity: false },
  { name: 'Barguna', nameBn: 'বরগুনা', division: 'Barishal', isDhakaCity: false },
  { name: 'Jhalokati', nameBn: 'ঝালকাঠি', division: 'Barishal', isDhakaCity: false },

  // Rangpur Division
  { name: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur', isDhakaCity: false },
  { name: 'Dinajpur', nameBn: 'দিনাজপুর', division: 'Rangpur', isDhakaCity: false },
  { name: 'Gaibandha', nameBn: 'গাইবান্ধা', division: 'Rangpur', isDhakaCity: false },
  { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', division: 'Rangpur', isDhakaCity: false },
  { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', division: 'Rangpur', isDhakaCity: false },
  { name: 'Nilphamari', nameBn: 'নীলফামারী', division: 'Rangpur', isDhakaCity: false },
  { name: 'Panchagarh', nameBn: 'পঞ্চগড়', division: 'Rangpur', isDhakaCity: false },
  { name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', division: 'Rangpur', isDhakaCity: false },

  // Mymensingh Division
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh', isDhakaCity: false },
  { name: 'Jamalpur', nameBn: 'জামালপুর', division: 'Mymensingh', isDhakaCity: false },
  { name: 'Netrokona', nameBn: 'নেত্রকোণা', division: 'Mymensingh', isDhakaCity: false },
  { name: 'Sherpur', nameBn: 'শেরপুর', division: 'Mymensingh', isDhakaCity: false },
];

export function calculateShippingFee(
  districtName: string,
  subtotal: number,
  dhakaFee = 70,
  outsideFee = 130,
  freeThreshold = 2000
): number {
  if (subtotal >= freeThreshold) {
    return 0;
  }
  const district = BANGLADESH_DISTRICTS.find(d => d.name === districtName);
  if (district && district.isDhakaCity) {
    return dhakaFee;
  }
  return outsideFee;
}
