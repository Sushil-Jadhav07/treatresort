// All copy below is taken from https://treatresorts.com/
const img = (name) => `/images/${name}`

export const brand = {
  phone: '+91 96158 41584',
  phoneHref: 'tel:+919615841584',
  email: 'info@treatresorts.com',
  whatsapp: 'https://wa.me/9227990027',
  tagline: 'A Luxury Getaway In Nature',
}

export const properties = [
  { slug: 'silvassa', name: 'Treat Resort, Silvassa', place: 'Silvassa, UT', image: img('p-silvassa.webp'), book: 'https://www.swiftbook.io/', status: 'open' },
  { slug: 'thane', name: 'Saya Grand by Treat, Thane', place: 'Thane, Maharashtra', image: img('p-thane.webp'), status: 'open' },
  { slug: 'nashik', name: 'Treat Hotel, Nashik', place: 'Nashik, Maharashtra', image: img('p-nashik.png'), book: 'https://www.swiftbook.io/', status: 'open' },
  { slug: 'gholvad', name: 'Treat Beach Resort & Spa, Gholvad', place: 'Gholvad, Maharashtra', image: img('p-gholvad.webp'), book: 'https://www.swiftbook.io/', status: 'open' },
  { slug: 'sambhajinagar', name: 'Treat Imperial, Chhatrapati Sambhajinagar', place: 'Sambhajinagar, MH', image: img('p-sambhajinagar.webp'), status: 'open' },
  { slug: 'kumbhalgarh', name: 'Treat Aranya Resort, Kumbhalgarh', place: 'Kumbhalgarh, Rajasthan', image: img('p-kumbhalgarh.webp'), status: 'open' },
  { slug: 'udaipur', name: 'Treat Imperial Hridhaan, Udaipur', place: 'Udaipur, Rajasthan', image: img('p-udaipur.webp'), status: 'open' },
  { slug: 'corbett', name: 'Treat Imperial, Jim Corbett', place: 'Jim Corbett', image: img('p-corbett.webp'), status: 'open' },
  { slug: 'rajkot', name: 'Treat Resort, Rajkot', place: 'Rajkot, Gujarat', image: img('p-rajkot.webp'), status: 'Opening soon' },
  { slug: 'pushkar', name: 'Treat Hotel, Pushkar', place: 'Pushkar, Rajasthan', image: img('p-pushkar.png'), status: 'Coming Soon' },
  { slug: 'ahilyanagar', name: 'Treat Hotel, Ahilyanagar', place: 'Ahilyanagar, Maharashtra', image: img('p-ahilyanagar.webp'), status: 'Coming Soon' },
  { slug: 'vrindavan', name: 'Treat Hotel, Vrindavan', place: 'Vrindavan, Uttar Pradesh', image: img('p-vrindavan.webp'), status: 'Coming Soon' },
  { slug: 'sangamner', name: 'Treat Resort, Sangamner', place: 'Sangamner, Maharashtra', image: img('p-sangamner.webp'), status: 'Coming Soon' },
]

export const newUpcoming = ['ahilyanagar', 'vrindavan', 'sangamner', 'udaipur'].map((s) =>
  properties.find((p) => p.slug === s),
)

export const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'Our Properties', href: '#properties', dropdown: true },
  { label: 'Wedding Vows', href: '#weddings' },
  { label: 'Corporate', href: '#corporate' },
  { label: 'Partner with us', href: '#enquire' },
  { label: 'Special Offers', href: '#offers' },
]

export const navProperties = [
  'Treat Resort, Silvassa',
  'Saya Grand by Treat, Thane',
  'Treat Hotel, Nashik',
  'Treat Beach Resort & Spa, Gholvad',
  'RAS Resort by Treat, Silvassa',
  'DGV Resort by Treat, Silvassa',
  'Urbane by Treat, Daman',
  'Treat Aranya Resort, Kumbhalgarh',
  'Treat Imperial, Chhatrapati Sambhajinagar',
  'Treat Imperial, Jim Corbett',
  'Treat Resort, Rajkot',
  'Treat Imperial Hridhaan, Udaipur',
]

export const intro = {
  eyebrow: 'Redefining Hospitality',
  heading: ['Redefining', 'hospitality.'],
  body:
    'Step into a world where every stay, celebration, and gathering is thoughtfully curated to create lasting memories. Across destinations and experiences, Treat Hotels & Resorts brings together timeless hospitality with modern luxury.',
  points: [
    { title: 'Dream weddings and grand celebrations', icon: 'heart' },
    { title: 'Seamless corporate events and meetings', icon: 'briefcase' },
    { title: 'Adventurous getaways and serene staycations', icon: 'compass' },
    { title: 'Exquisite dining and impeccable service', icon: 'utensils' },
  ],
  cta: 'Learn More',
}

export const propertiesCopy = {
  eyebrow: 'Explore Our Properties',
  heading: ['Explore our', 'properties.'],
  body:
    'From riverside retreats and beachside escapes to city landmarks and nature hideaways, discover a collection of hotels and resorts designed for every kind of traveller and every kind of occasion.',
}

export const weddings = {
  eyebrow: 'Weddings by Treat',
  heading: ['Iconic weddings', 'by Treat.'],
  body: [
    'From opulent ballrooms and expansive banquet halls to serene gardens, riverfront settings, and beachside backdrops, Treat Hotels & Resorts offers diverse wedding destinations tailored for every celebration.',
    'Whether it’s an intimate mehendi, a vibrant sangeet, or a grand reception, our properties are designed to host every moment of your wedding journey seamlessly.',
  ],
  cta: 'Explore More',
  // order matters: it maps onto the bento grid cells (big, tall, tall, wide, wide)
  gallery: [
    { image: img('p-udaipur.webp'), alt: 'Wedding lawn at Treat Imperial Hridhaan, Udaipur', position: 'center 70%' },
    { image: img('w-destination.webp'), alt: 'Destination Wedding Resorts', position: '30% center' },
    { image: img('w-luxury.webp'), alt: 'Luxury Wedding Resorts', position: 'center' },
    { image: img('c-galas.webp'), alt: 'Grand wedding reception in a ballroom', position: 'center' },
    { image: img('w-beach.webp'), alt: 'Beach Wedding Resorts', position: 'center 40%' },
  ],
  tags: ['Destination Wedding Resorts', 'Beach Wedding Resorts', 'Luxury Wedding Resorts'],
}

export const corporate = {
  eyebrow: 'Corporate Getaways & Events',
  heading: 'Experience the art of impeccable hosting.',
  body:
    'From large-scale conferences to curated executive retreats, Treat Hotels & Resorts offers versatile venues and professional expertise to transform every corporate event into a seamless and impactful experience.',
  cta: 'Explore more',
  items: [
    { title: 'Large-Scale Conferences', text: 'Designed for scale, precision, and impactful communication.', image: img('c-conferences-large.webp') },
    { title: 'Corporate Galas', text: 'Elegant evenings that celebrate success in style and sophistication.', image: img('c-galas.webp') },
    { title: 'Product Launches', text: 'Create unforgettable first impressions with dynamic and well-executed launch events.', image: img('c-launch.webp') },
    { title: 'Round Table Gatherings', text: 'Intimate and focused spaces for meaningful discussions and strategic decisions.', image: img('c-roundtable.webp') },
    { title: 'Team Getaways', text: 'Inspire collaboration and connection through engaging offsite experiences.', image: img('c-team.webp') },
    { title: 'Conferences', text: 'Host impactful conferences with modern amenities and seamless execution.', image: img('c-conferences.webp') },
    { title: 'Awards Shows', text: 'Celebrate excellence with grand, well-orchestrated award ceremonies.', image: img('c-awards.webp') },
    { title: 'Adventure Retreats', text: 'Blend work with excitement at Treat Adventure Park, Silvassa for high-energy team experiences.', image: img('c-adventure.webp') },
  ],
}

export const offers = {
  eyebrow: 'Latest Offers',
  heading: ['Latest', 'offers.'],
  cta: 'Explore More',
  items: [
    { image: img('o-1.webp'), note: 'Treat Resort' },
    { image: img('o-2.webp'), note: 'Festive stays' },
    { image: img('o-3.webp'), note: 'Urbane by Treat' },
    { image: img('o-4.webp'), note: 'Treat Hotel' },
    { image: img('o-5.webp'), note: 'Getaway offer' },
    { image: img('o-6.webp'), note: 'Special offer' },
    { image: img('o-7.webp'), note: 'Stay & save' },
    { image: img('o-8.webp'), note: 'Treat Aranya' },
    { image: img('o-9.webp'), note: 'Saya Grand' },
  ],
}

export const culinary = {
  eyebrow: 'Dining at Treat',
  heading: ['A culinary journey', 'to remember.'],
  body:
    'From sunlit brunches to moonlit desserts, our all-day menu is a passport to global tastes—always fresh, always inviting.',
  cta: 'Reserve your table',
  venues: [
    { title: 'Rooftop', tag: 'Rooftop at Cloud 25', image: img('d-rooftop.webp'), alt: img('d-rooftop-cloud25.webp') },
    { title: 'Flavors Of Zaika', tag: 'Flavors of Zaika', image: img('d-zaika.webp'), alt: img('d-zaika-outdoor.webp') },
    { title: 'Night life At Euphoria', tag: 'Nightlife at Euphoria', image: img('d-euphoria.png'), alt: img('d-nightlife.webp') },
  ],
  caption: 'A taste of your destination.',
}

export const why = {
  eyebrow: 'Why Choose Treat',
  heading: ['Why choose', 'Treat Hotels & Resorts.'],
  cards: [
    { title: 'Diverse Destinations Across India', text: 'From beachside and riverside escapes to forest retreats and city hotels.' },
    { title: 'Celebrations, Perfected', text: 'Expertly crafted weddings, social events, and corporate gatherings across all scales.' },
    { title: 'All-in-One Experiences', text: 'Stay, dine, celebrate, and unwind—everything seamlessly integrated.' },
    { title: 'Signature Hospitality', text: 'A legacy of warmth, attention to detail, and guest-first experiences.' },
    { title: 'Growing Footprint, Consistent Excellence', text: 'Expanding across destinations while maintaining the highest standards of service.' },
    { title: 'Proven Trust & Legacy', text: 'Backed by 40+ years of experience, a team of 1,200+ professionals, and a strong customer base across key markets.' },
  ],
  stats: [
    { value: 40, suffix: '+', label: 'Years of experience' },
    { value: 1200, suffix: '+', label: 'Professionals' },
    { value: 13, suffix: '', label: 'Hotels & resorts' },
  ],
}

export const moments = {
  eyebrow: 'Moments In A Frame',
  heading: ['Moments', 'in a frame.'],
  body: 'A visual journey of luxury, serenity, and unforgettable moments. From stunning properties to breathtaking landscapes.',
  cta: 'Explore Gallery',
  rows: [
    [
      { image: img('g-1.webp'), caption: 'Luxury Wedding Resorts' },
      { image: img('g-2.webp'), caption: 'Best room in resort' },
      { image: img('g-3.webp'), caption: 'Best breakfast in resort' },
      { image: img('g-4.webp'), caption: 'Corporate parties' },
      { image: img('g-5.webp'), caption: 'Beach Wedding Resorts' },
      { image: img('g-6.webp'), caption: 'Corporate party places' },
    ],
    [
      { image: img('p-silvassa.webp'), caption: 'Treat Resort, Silvassa' },
      { image: img('d-bistro.webp'), caption: 'Dining at Treat' },
      { image: img('p-gholvad.webp'), caption: 'Treat Beach Resort' },
      { image: img('c-galas.webp'), caption: 'Corporate galas' },
      { image: img('p-thane.webp'), caption: 'Saya Grand, Thane' },
      { image: img('w-beach.webp'), caption: 'Beachside wedding' },
    ],
  ],
}

export const testimonials = {
  eyebrow: 'Testimonials',
  heading: ['The stays that', 'stay with you.'],
  items: [
    {
      quote:
        'An exclusive resort with excellent facilities! We had a great business meeting here, and the experience was smooth and professional. The team guided us throughout and ensured everything was well-organized. Perfect venue for corporate events and offsites.',
      author: 'ICICI Bank',
      property: 'Treat Resort Silvassa',
      image: img('p-silvassa.webp'),
    },
    {
      quote:
        'We had organised team building activity for a group of 100+ employees. The entire staff was supportive and we had wonderful time. Mr dhruv, Mr mahendra & chef vipin were super helpful and ensured we had a memorable stay.',
      author: 'L&T',
      property: 'Treat Beach Resort & Spa',
      image: img('p-gholvad.webp'),
    },
    {
      quote:
        'Nice arrangements & cooperative staff members, awesome food quality, huge parking for marriage or corporate function, unbelievable cleanliness of rooms & greenery, great place for destination wedding.',
      author: 'KEI Industries Limited',
      property: 'Ras Resort by Treat',
      image: img('g-1.webp'),
    },
    {
      quote:
        'Friends & Family summer Fun Trip. Amazing Fantastic Experience & Super Hospitality Services. Must try it & enjoy the water park. Check-in and check-out smoothly and team warm welcoming and nice greet to guest. Swimming pool was awesome, nice atmosphere.',
      author: 'Dr Mayuri Kheni',
      property: 'DGV by Treat',
      image: img('g-5.webp'),
    },
    {
      quote:
        'Had a wonderful weekend stay here! The service was excellent and the food absolutely delicious. The entire experience felt luxurious and relaxing, and the staff made it even more special. All the staff were very humble and attentive — truly a memorable stay. Highly recommended!',
      author: 'Taksh Chaudhry',
      property: 'Urbane by Treat',
      image: img('g-3.webp'),
    },
    {
      quote:
        'Loved our stay! I recently stayed at Saya Resort with my family, and we had a wonderful time. The rooms were perfect, and we especially enjoyed the special welcome drink. The staff was very cooperative. Truly loved the experience!',
      author: 'Rohit Patil',
      property: 'Saya Grand by Treat',
      image: img('p-thane.webp'),
    },
  ],
}

export const enquire = {
  eyebrow: 'Enquire Now',
  heading: ['Enquire', 'now!'],
  properties: [
    'Treat Resort, Silvassa',
    'Saya Grand by Treat, Thane',
    'Treat Hotel, Nashik',
    'Treat Beach Resort & Spa, Gholvad',
    'Ras Resort by Treat, Silvassa',
    'DGV Resort by Treat, Silvassa',
    'Urbane by Treat, Daman',
    'Treat Aranya Resort, Kumbhalgarh',
    'Treat Imperial, Chhatrapati Sambhajinagar',
    'Treat Imperial, Jim Corbett',
    'Treat Resort, Rajkot',
    'Treat Imperial Hridhaan, Udaipur',
  ],
  cities: [
    'Adalaj','Adityana','Agartala','Ahmedabad','Ahmednagar','Akola','Alang','Ambaji','Ambaliyasan','Amli','Amravati','Amreli','Anand','Andada','Anjar','Anklav','Ankleshwar','Antaliya','Arambhada','Atul','Aurangabad','Badharghat','Bangalore','Baramati','Bharuch','Bhavnagar','Bhopal','Bhuj','Cambay','Chalisgaon','Chikmagalur','Chinchani','Dahod','Daman and Diu','Davanagere','Deesa','Devgarh','Dharampur','Dharmanagar','Dharwad','Dholka','Dhule','Dombivli','Durgapur','Gadag','Gandhinagar','Godhra','Gwalior','Himatnagar','Hubli','Ichalkaranji','Idar','Indore','Indranagar','Itarsi','Jabalpur','Jalna','Jamnagar','Jogendranagar','Junagadh','Kadi','Kailasahar','Kalavad','Kalol','Kalyan','Kapadvanj','Karaikal','Karjan','Keshod','Khambhalia','Khambhat','Kheda','Khedbrahma','Kheralu','Khowai','Kodinar','Kolhapur','Lathi','Latur','Limbdi','Loha','Lonar','Lonavla','Lunawada','Mahad','Mahe','Mahesana','Mahuli','Mahuva','Malegaon','Malkapur','Manavadar','Manchar','Mandvi','Mangalore','Mangalvedhe','Mangrol','Mangrulpir','Manjlegaon','Manmad','Mansa','Manwath','Mehkar','Mehmedabad','Mhaswad','Miraj','Modasa','Morshi','Morvi','Mukhed','Mul','Mumbai','Murtijapur','Mysore','Nadiad','Nagpur','Nalasopara','Nanded-Waghala','Nandgaon','Nandura','Nandurbar','Narkhed','Nashik','Navi Mumbai','Navsari','Nawapur','Nilanga','Osmanabad','Ozar','Pachora','Padra','Paithan','Palanpur','Palghar','Palitana','Pandharkaoda','Pandharpur','Panvel','Parbhani','Pardi','Parli','Parola','Partur','Patan','Pathardi','Pathri','Patur','Pauni','Pen','Petlad','Phaltan','Pondicherry','Porbandar','Pratapgarh','Pulgaon','Pune','Purna','Pusad','Radhanpur','Rahuri','Rajkot','Rajpipla','Rajula','Rajura','Ramtek','Ranavav','Rapar','Ratnagiri','Raver','Risod','Sailu','Salaya','Sanand','Sangamner','Sangli','Sangole','Sasvad','Satana','Satara','Savarkundla','Savner','Sawantwadi','Shahade','Shegaon','Shendurjana','Shirdi','Shirpur-Warwade','Shirur','Shrigonda','Shrirampur','Sidhpur','Sihor','Sillod','Silvassa','Sinnar','Solapur','Songadh','Soyagaon','Surat','Talaja','Talegaon Dabhade','Talode','Tasgaon','Thangadh','Tharad','Tirora','Tuljapur','Tumsar','Uchgaon','Udaipur','Udgir','Ujjain','Umarga','Umarkhed','Umbergaon','Umred','Umreth','Una','Unjha','Upleta','Uran','Uran Islampur','Vadgaon Kasba','Vadnagar','Vadodara','Vaijapur','Valsad','Vapi','Vasai','Veraval','Vijapur','Viramgam','Virar','Visnagar','Vita','Vyara','Wadgaon Road','Wadhwan','Wai',
  ],
}

export const cta = {
  heading: ['See you at', 'Treat.'],
  button: 'Reserve Now',
}

export const footer = {
  columns: [
    [
      { label: 'About Us', href: 'https://treatresorts.com/about-us/' },
      { label: 'Our Properties', href: '#properties' },
      { label: 'Awards', href: 'https://treatresorts.com/awards/' },
      { label: 'Blog', href: 'https://treatresorts.com/blog/' },
    ],
    [
      { label: 'New & Upcoming', href: '#new-upcoming' },
      { label: 'Feedback', href: '#testimonials' },
      { label: 'Media & PR', href: 'https://treatresorts.com/media-pr/' },
      { label: 'Careers', href: 'https://treatresorts.com/careers/' },
    ],
    [
      { label: 'Factsheet', href: 'https://treatresorts.com/factsheets/' },
      { label: 'Contact Us', href: '#enquire' },
      { label: 'Privacy Policy', href: 'https://treatresorts.com/privacy-policy/' },
      { label: 'Terms & Conditions', href: 'https://treatresorts.com/terms-and-conditions/' },
    ],
  ],
  hotels: [
    'Treat Resort, Silvassa',
    'Treat Adventure Park, Silvassa',
    'Treat Beach Resort & Spa, Gholvad',
    'RAS Resort by Treat, Silvassa',
    'Urbane by Treat, Daman',
    'Treat Hotel, Nashik',
    'Saya Grand by Treat, Thane',
    'DGV Resort by Treat, Silvassa',
    'Treat Aranya Resort, Kumbhalgarh',
    'Treat Imperial, Chhatrapati Sambhajinagar',
    'Treat Imperial, Jim Corbett',
    'Treat Resort, Rajkot',
    'Treat Imperial Hridhaan, Udaipur',
  ],
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/treatimperialjimcorbett' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61582080026669' },
    { label: 'Youtube', href: 'https://www.youtube.com/@treathotelsandresorts' },
  ],
  notice:
    'Important Notice: Fraudulent websites and individuals are using the Treat name to collect payments. Book only at www.treatresorts.com and verify that emails end in @treatresorts.com. For enquiries call +91 9615791579 or write to info@treatresorts.com. Never share OTPs or pay via unverified WhatsApp links.',
}

// Locations used by the map in the closing section (query = what Google Maps searches for)
export const locations = [
  { name: 'Treat Resort, Silvassa', place: 'Silvassa, UT', query: 'Treat Resort, Silvassa, Dadra and Nagar Haveli' },
  { name: 'Saya Grand by Treat, Thane', place: 'Thane, Maharashtra', query: 'Saya Grand by Treat, Thane, Maharashtra' },
  { name: 'Treat Hotel, Nashik', place: 'Nashik, Maharashtra', query: 'Treat Hotel, Nashik, Maharashtra' },
  { name: 'Treat Beach Resort & Spa, Gholvad', place: 'Gholvad, Maharashtra', query: 'Treat Beach Resort & Spa, Gholvad, Maharashtra' },
  { name: 'RAS Resort by Treat, Silvassa', place: 'Silvassa, UT', query: 'RAS Resort by Treat, Silvassa' },
  { name: 'DGV Resort by Treat, Silvassa', place: 'Silvassa, UT', query: 'DGV Resort by Treat, Silvassa' },
  { name: 'Urbane by Treat, Daman', place: 'Daman', query: 'Urbane by Treat, Daman' },
  { name: 'Treat Aranya Resort, Kumbhalgarh', place: 'Kumbhalgarh, Rajasthan', query: 'Treat Aranya Resort, Kumbhalgarh, Rajasthan' },
  { name: 'Treat Imperial, Chhatrapati Sambhajinagar', place: 'Sambhajinagar, Maharashtra', query: 'Treat Imperial, Chhatrapati Sambhajinagar, Maharashtra' },
  { name: 'Treat Imperial, Jim Corbett', place: 'Jim Corbett', query: 'Treat Imperial, Jim Corbett, Uttarakhand' },
  { name: 'Treat Resort, Rajkot', place: 'Rajkot, Gujarat', query: 'Treat Resort, Rajkot, Gujarat' },
  { name: 'Treat Imperial Hridhaan, Udaipur', place: 'Udaipur, Rajasthan', query: 'Treat Imperial Hridhaan, Udaipur, Rajasthan' },
]
