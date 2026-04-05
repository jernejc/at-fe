import type { LatLng } from './coordinates';

export interface GoogleOffice {
  name: string;
  city: string;
  state: string;
  address: string;
  position: LatLng;
}

/**
 * Sourced from https://about.google/company-info/locations/ — North America region.
 * Coordinates and addresses extracted from the official locations page HTML.
 */
export const GOOGLE_OFFICES_NA: GoogleOffice[] = [
  { name: 'Google Ann Arbor', city: 'Ann Arbor', state: 'MI', address: '2300 Traverwood Dr, Ann Arbor, MI 48105', position: { lat: 42.3061455, lng: -83.71427371 } },
  { name: 'Google Atlanta', city: 'Atlanta', state: 'GA', address: '1105 W Peachtree St NW, Atlanta, GA 30309', position: { lat: 33.784806, lng: -84.387556 } },
  { name: 'Google Austin', city: 'Austin', state: 'TX', address: '500 W 2nd St, Austin, TX 78701', position: { lat: 30.266014, lng: -97.749222 } },
  { name: 'Google Boulder - Pearl Street', city: 'Boulder', state: 'CO', address: '2930 Pearl St, Boulder, CO 80301', position: { lat: 40.021603, lng: -105.25445 } },
  { name: 'Google Boulder - Walnut Street', city: 'Boulder', state: 'CO', address: '3333 Walnut St, Boulder, CO 80301', position: { lat: 40.02095, lng: -105.249206 } },
  { name: 'Google Cambridge', city: 'Cambridge', state: 'MA', address: '325 Main Street, Cambridge, MA 02142', position: { lat: 42.362742, lng: -71.086628 } },
  { name: 'Google Chicago - Carpenter St', city: 'Chicago', state: 'IL', address: '210 N Carpenter St, Chicago, IL 60607', position: { lat: 41.885797, lng: -87.653917 } },
  { name: 'Google Chicago - Fulton Market', city: 'Chicago', state: 'IL', address: '320 N Morgan St Suite 600, Chicago, IL 60607', position: { lat: 41.887289, lng: -87.652621 } },
  { name: 'Google Dallas', city: 'Addison', state: 'TX', address: '15303 North Dallas Parkway Suite 1100, Addison, TX 75001', position: { lat: 32.958766, lng: -96.822211 } },
  { name: 'Google Detroit', city: 'Detroit', state: 'MI', address: '52 Henry St, Detroit, MI 48201', position: { lat: 42.34046, lng: -83.054491 } },
  { name: 'Google Durham', city: 'Durham', state: 'NC', address: '200 Morris St, Durham, NC 27701', position: { lat: 35.999216, lng: -78.903371 } },
  { name: 'Google Houston', city: 'Houston', state: 'TX', address: '3663 Washington Ave, Houston, TX 77007', position: { lat: 29.7690634, lng: -95.3962718 } },
  { name: 'Google Irvine', city: 'Irvine', state: 'CA', address: '19510 Jamboree Rd, Irvine, CA 92612', position: { lat: 33.658792, lng: -117.859322 } },
  { name: 'Google Kirkland - 6th St Campus', city: 'Kirkland', state: 'WA', address: '777 6th St South Building A, Kirkland, WA 98033', position: { lat: 47.669568, lng: -122.196912 } },
  { name: 'Google Kirkland - Kirkland Urban', city: 'Kirkland', state: 'WA', address: '425 Urban Plz, Kirkland, WA 98033', position: { lat: 47.6776068, lng: -122.1990727 } },
  { name: 'Google Kitchener', city: 'Kitchener', state: 'ON', address: '51 Breithaupt St, Kitchener, ON N2H 5G5', position: { lat: 43.454395, lng: -80.49868 } },
  { name: 'Google Los Angeles', city: 'Venice', state: 'CA', address: '340 Main St, Venice, CA 90291', position: { lat: 33.995609, lng: -118.477028 } },
  { name: 'Google Madison', city: 'Madison', state: 'WI', address: '811 E Washington Ave, Madison, WI 53703', position: { lat: 43.080922, lng: -89.374415 } },
  { name: 'Google Miami', city: 'Miami', state: 'FL', address: '1450 Brickell Ave Suite 901, Miami, FL 33131', position: { lat: 25.7585441, lng: -80.1931097 } },
  { name: 'Google Montréal', city: 'Montréal', state: 'QC', address: '425 Av. Viger O, Montréal, QC H2Z 1W5', position: { lat: 45.5033141, lng: -73.5628767 } },
  { name: 'Google Mountain View - Bay View', city: 'Mountain View', state: 'CA', address: '100 Bay View Drive, Mountain View, CA 94043', position: { lat: 37.423439, lng: -122.066446 } },
  { name: 'Google Mountain View - Googleplex', city: 'Mountain View', state: 'CA', address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', position: { lat: 37.421512, lng: -122.084101 } },
  { name: 'Google NYC - 9th Avenue', city: 'New York', state: 'NY', address: '111 8th Ave, New York, NY 10011', position: { lat: 40.74136, lng: -74.003199 } },
  { name: 'Google NYC - Chelsea Market', city: 'New York', state: 'NY', address: '75 9th Ave, New York, NY 10011', position: { lat: 40.742438, lng: -74.005829 } },
  { name: 'Google NYC - Pier 57', city: 'New York', state: 'NY', address: '29 11th Ave, Pier 57, New York, NY 10011', position: { lat: 40.743606, lng: -74.010793 } },
  { name: 'Google NYC - St. John\'s Terminal', city: 'New York', state: 'NY', address: '550 Washington St, New York, NY 10014', position: { lat: 40.728604, lng: -74.009828 } },
  { name: 'Google Pittsburgh', city: 'Pittsburgh', state: 'PA', address: '6425 Penn Ave, Pittsburgh, PA 15206', position: { lat: 40.45716, lng: -79.916596 } },
  { name: 'Google Playa Vista', city: 'Playa Vista', state: 'CA', address: '5865 Campus Center Drive, Playa Vista, CA 90094', position: { lat: 33.977601, lng: -118.408207 } },
  { name: 'Google Portland', city: 'Portland', state: 'OR', address: '555 SW Morrison St Ste 500, Portland, OR 97204', position: { lat: 45.519328, lng: -122.67806 } },
  { name: 'Google Reston', city: 'Reston', state: 'VA', address: '1900 Reston Metro Plaza, Reston, VA 20190', position: { lat: 38.9483181, lng: -77.3375166 } },
  { name: 'Google San Bruno', city: 'San Bruno', state: 'CA', address: '901 Cherry Ave, San Bruno, CA 94066', position: { lat: 37.627892, lng: -122.4261268 } },
  { name: 'Google San Diego', city: 'San Diego', state: 'CA', address: '6420 Sequence Dr, San Diego, CA 92121', position: { lat: 32.909578, lng: -117.181893 } },
  { name: 'Google San Francisco - 121 Spear St', city: 'San Francisco', state: 'CA', address: '121 Spear St, San Francisco, CA 94105', position: { lat: 37.791868, lng: -122.392829 } },
  { name: 'Google San Francisco - 345 Spear St', city: 'San Francisco', state: 'CA', address: '345 Spear St, San Francisco, CA 94105', position: { lat: 37.789972, lng: -122.390013 } },
  { name: 'Google San Francisco - One Market Plaza', city: 'San Francisco', state: 'CA', address: '1 Market St, San Francisco, CA 94105', position: { lat: 37.7940319, lng: -122.3949414 } },
  { name: 'Google San José', city: 'San Jose', state: 'CA', address: '255 W Tasman Dr, San Jose, CA 95134', position: { lat: 37.41187, lng: -121.953917 } },
  { name: 'Google Seattle', city: 'Seattle', state: 'WA', address: '1021 Valley St, Seattle, WA 98109', position: { lat: 47.62549067, lng: -122.3365714 } },
  { name: 'Google Sunnyvale - 237 MPD', city: 'Sunnyvale', state: 'CA', address: '237 Moffett Park Dr, Sunnyvale, CA 94089', position: { lat: 37.4059738, lng: -122.0188076 } },
  { name: 'Google Sunnyvale - Humboldt', city: 'Sunnyvale', state: 'CA', address: '242 Humboldt Ct, Sunnyvale, CA 94089', position: { lat: 37.40725274, lng: -122.015933 } },
  { name: 'Google Sunnyvale - Moffett Place', city: 'Sunnyvale', state: 'CA', address: '1195 Borregas Ave, Sunnyvale, CA 94089', position: { lat: 37.4077328, lng: -122.0202865 } },
  { name: 'Google Thornton', city: 'Thornton', state: 'CO', address: '12396 Grant St, Thornton, CO 80241', position: { lat: 39.92247765, lng: -104.9831927 } },
  { name: 'Google Toronto', city: 'Toronto', state: 'ON', address: '65 King St E, Toronto, ON M5C 1G3', position: { lat: 43.649499, lng: -79.375482 } },
  { name: 'Google Washington, D.C.', city: 'Washington', state: 'DC', address: '25 Massachusetts Ave NW, Washington, DC 20001', position: { lat: 38.898419, lng: -77.010419 } },
];
