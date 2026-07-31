function brandIcon(letter, bg, fg = '#ffffff') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="${bg}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="160" font-weight="900" fill="${fg}">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const products = [
  {
    id: 1,
    name: 'Nanit Pro Smart Camera',
    category: 'smart_tech',
    subcategory: 'Baby Tech',
    brand: 'Nanit',
    price: 299.99,
    originalPrice: null,
    description: 'HD video with sleep tracking and breathing motion monitoring. Keep an eye on your baby with ultimate clarity.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBezkUr28nhggeQJQ2LmHCstYHSSMxyny0IzhIpGq3w0y5Yt9zD647fBq-YRw4Wuyo_dq2It6-ZsUnqTjLk1580kh4pxGh7a6MlVRf3ZSV7Z8ElS6Rpkgzm6no64ZLYrbK-LmTBttd5ZOf4x7OPWnzdn8mZPKGFQAhtcfkvpwb4ffsgBdWBX8ALB4in68xeimvHPAS1VbuFpZ26I-SulFe0c6wdvyyx7VJorHs0ou7JbQgyJJZvr4S6BxK4-eD12byNyaPS2x8-argC',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBezkUr28nhggeQJQ2LmHCstYHSSMxyny0IzhIpGq3w0y5Yt9zD647fBq-YRw4Wuyo_dq2It6-ZsUnqTjLk1580kh4pxGh7a6MlVRf3ZSV7Z8ElS6Rpkgzm6no64ZLYrbK-LmTBttd5ZOf4x7OPWnzdn8mZPKGFQAhtcfkvpwb4ffsgBdWBX8ALB4in68xeimvHPAS1VbuFpZ26I-SulFe0c6wdvyyx7VJorHs0ou7JbQgyJJZvr4S6BxK4-eD12byNyaPS2x8-argC'
    ],
    rating: 4.9,
    reviews: 124,
    features: ['HD 1080p Video', 'Sleep Tracking', 'Breathing Motion Monitoring', 'Hipoalergénico'],
    inStock: true,
    stock: 3,
    createdAt: '2025-01-10',
    colors: ['Blanco'],
    sizes: ['Única']
  },
  {
    id: 2,
    name: 'Phone Pro Max X',
    category: 'smart_tech',
    subcategory: 'Mobile Tech',
    brand: 'Apple',
    price: 1099.00,
    originalPrice: null,
    description: 'Titanium design, ultimate camera system, and the fastest chip ever in a smartphone. Built for professionals.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANUHd-hiIzaKYIMqu70oZR4F4ijExjKG7K7fn3cp_dC9sJrArKQldMSPEr77DER1Gxcbhk37DcYaSSWGozjCOKWTSC7fC-IKYGscELa6hcCep1FB5jIFkcOXtzpdp4LKarv8h0eetjd8NjB4-IZ_ECq9pTnbESNKaJfyz82pxlRoQOuYbOar9TUUy7RQIw3LB5z_erSf1kPBjcFdhOtSqml7nYTKbuNJj55TgWs9q6OKk2Wc_k4ym-T6Kg_wB8-LnVdqGVHKzNeac6',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANUHd-hiIzaKYIMqu70oZR4F4ijExjKG7K7fn3cp_dC9sJrArKQldMSPEr77DER1Gxcbhk37DcYaSSWGozjCOKWTSC7fC-IKYGscELa6hcCep1FB5jIFkcOXtzpdp4LKarv8h0eetjd8NjB4-IZ_ECq9pTnbESNKaJfyz82pxlRoQOuYbOar9TUUy7RQIw3LB5z_erSf1kPBjcFdhOtSqml7nYTKbuNJj55TgWs9q6OKk2Wc_k4ym-T6Kg_wB8-LnVdqGVHKzNeac6'
    ],
    rating: 4.8,
    reviews: 412,
    features: ['Titanium Case', 'Super Retina XDR Display', 'A17 Pro Chip', 'Triple Camera System'],
    inStock: true,
    stock: 12,
    createdAt: '2025-02-15',
    colors: ['Titanio', 'Negro', 'Azul'],
    sizes: ['128GB', '256GB', '512GB']
  },
  {
    id: 3,
    name: 'Vista V2 Convertible Stroller',
    category: 'baby_gear',
    subcategory: 'Baby Gear',
    brand: 'UPPAbaby',
    price: 999.99,
    originalPrice: null,
    description: 'Full-size stroller with reversible seat and modular components that convert easily as your family grows.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjeDetrF4pBrJzTvMCfORza0f9CWX5dS5uVD39Y2oN4bbc7qUZQ2XUaSsFZqgjP83fvpw02JMoiwHayDyFxCIUi76BWNykpVCxj9ch3O1x-4N9GE4aUzcVE7L3KkSR-9RfNoUZqSo-46n271udcgbEKOhQuhIzjM6f6Xq6L_EpyDBsHeVyW5wCltwUUALYSYbueKlzEohaySsViBYVZma6cjz4K3siHwKmj4kzpbwzwWL2nDe175r5zGgvxJ5XvUdBvjvhiRwQqeoH',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjeDetrF4pBrJzTvMCfORza0f9CWX5dS5uVD39Y2oN4bbc7qUZQ2XUaSsFZqgjP83fvpw02JMoiwHayDyFxCIUi76BWNykpVCxj9ch3O1x-4N9GE4aUzcVE7L3KkSR-9RfNoUZqSo-46n271udcgbEKOhQuhIzjM6f6Xq6L_EpyDBsHeVyW5wCltwUUALYSYbueKlzEohaySsViBYVZma6cjz4K3siHwKmj4kzpbwzwWL2nDe175r5zGgvxJ5XvUdBvjvhiRwQqeoH'
    ],
    rating: 5.0,
    reviews: 84,
    features: ['Convertible design', 'One-step fold', 'Includes bassinet', 'Reversible toddler seat'],
    inStock: true,
    stock: 2,
    createdAt: '2025-03-01',
    colors: ['Gris', 'Negro', 'Verde'],
    sizes: ['Única']
  },
  {
    id: 4,
    name: 'QuietComfort Ultra',
    category: 'audio_gear',
    subcategory: 'Audio Gear',
    brand: 'Bose',
    price: 429.00,
    originalPrice: null,
    description: 'World-class noise cancellation, breakthrough spatialized audio, and premium materials for luxurious comfort.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWm0ELDtAoiqqHwcqNmck7y6TlPoXc3xMxBlelPg5eh8UNC_OTekQJoxdcHnmVVm1yw0ZyQUwAckN3bS5IAXxDXhv_HEJ9daT2IWsSprR_JQ5KeHE5etnGgWC48N_xo50SU2lmAU4MtzdnidC6Vrt9WsGm45nZuWaJcvdS-kkbB5Uo7socGmlONFOBF3JM5SrJqLPOb9lWey-X6lGvK3IucOzU5rY7YA3Vs9aoB0EWanpHUVOVHMbvbW9u_NPAlGwLry2GdJQBTjzP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWm0ELDtAoiqqHwcqNmck7y6TlPoXc3xMxBlelPg5eh8UNC_OTekQJoxdcHnmVVm1yw0ZyQUwAckN3bS5IAXxDXhv_HEJ9daT2IWsSprR_JQ5KeHE5etnGgWC48N_xo50SU2lmAU4MtzdnidC6Vrt9WsGm45nZuWaJcvdS-kkbB5Uo7socGmlONFOBF3JM5SrJqLPOb9lWey-X6lGvK3IucOzU5rY7YA3Vs9aoB0EWanpHUVOVHMbvbW9u_NPAlGwLry2GdJQBTjzP'
    ],
    rating: 4.7,
    reviews: 312,
    features: ['Active Noise Cancelling', 'Spatial Audio', 'Up to 24 Hours Battery', 'CustomTune Technology'],
    inStock: true,
    stock: 8,
    createdAt: '2025-01-20',
    colors: ['Plata', 'Negro'],
    sizes: ['Única']
  },
  {
    id: 5,
    name: 'Series 9 Ultra Watch',
    category: 'wearables',
    subcategory: 'Wearables',
    brand: 'Apple',
    price: 799.00,
    originalPrice: null,
    description: 'The most capable and rugged wearable yet, designed for endurance, exploration, and heavy workout tracking.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4bflcb2x_29ogysKf-LZhCD1mXwt0D5agvQhDL1AfXMLZjuCjtldMwvBLyaRVjkG9fXiD-olCMrppqizKhW5c8il4mT0mOAGp_cr1kGU9fLP7myJSh5LPgES1hiDNt9dZ60zHb3nCgkcPPARYfImsWNRU_kfYDwlt28_prFhT5aTg4aUW4In6m1t9U81EH20ynl54_XotdP206UhXCHMDqF8ifyHGPyfrl1P85dzCiNz6gLbf7lq1tuXVZtaN2OmhTmglwpK_VaVr',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4bflcb2x_29ogysKf-LZhCD1mXwt0D5agvQhDL1AfXMLZjuCjtldMwvBLyaRVjkG9fXiD-olCMrppqizKhW5c8il4mT0mOAGp_cr1kGU9fLP7myJSh5LPgES1hiDNt9dZ60zHb3nCgkcPPARYfImsWNRU_kfYDwlt28_prFhT5aTg4aUW4In6m1t9U81EH20ynl54_XotdP206UhXCHMDqF8ifyHGPyfrl1P85dzCiNz6gLbf7lq1tuXVZtaN2OmhTmglwpK_VaVr'
    ],
    rating: 4.9,
    reviews: 184,
    features: ['Rugged Titanium Case', 'Up to 36 Hours Battery', 'Always-On Retina Display', 'Advanced Health Sensors'],
    inStock: true,
    stock: 5,
    createdAt: '2025-02-10',
    colors: ['Plata', 'Negro'],
    sizes: ['49mm']
  },
  {
    id: 6,
    name: 'SNOO Smart Sleeper',
    category: 'smart_tech',
    subcategory: 'Smart Sleep',
    brand: 'Nanit',
    price: 1355.00,
    originalPrice: 1595.00,
    description: 'Responsive bassinet that automatically soothes babies with sound and motion. Promotes healthier sleep cycles.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5r88sGeoasfN61uQYqXgRp-C7_WgUFh3Qg14Hlz7lUhXFFl9EFGCezRybU2qOi0Jkgo1W0GXpVjl8ZFguP_RLiuok8mBsdY726ir893DfWoSroZsvEZXf0CXN0RfnF5fYLZSTs-5WYC6uPD5ibx5zgdodaCNvXf-pghslAASj7HGVlsro0TE3RiMVMpOi5SXnxDDbU8itURPAqrgSk3aZ-fwKRZv1YrAHTnJphw36pL-jB77Z2OGhu9MPWTvrugdbveUI-vue29uF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5r88sGeoasfN61uQYqXgRp-C7_WgUFh3Qg14Hlz7lUhXFFl9EFGCezRybU2qOi0Jkgo1W0GXpVjl8ZFguP_RLiuok8mBsdY726ir893DfWoSroZsvEZXf0CXN0RfnF5fYLZSTs-5WYC6uPD5ibx5zgdodaCNvXf-pghslAASj7HGVlsro0TE3RiMVMpOi5SXnxDDbU8itURPAqrgSk3aZ-fwKRZv1YrAHTnJphw36pL-jB77Z2OGhu9MPWTvrugdbveUI-vue29uF'
    ],
    rating: 4.6,
    reviews: 215,
    features: ['Responsive Motion & Sound', 'Safe Swaddle Integration', 'Mobile App Insights', 'White Noise Machine'],
    inStock: true,
    stock: 4,
    createdAt: '2025-03-05',
    colors: ['Marrón'],
    sizes: ['Única']
  },
  {
    id: 7,
    name: 'Portabebé Ergónomico Cloud',
    category: 'baby_gear',
    subcategory: 'Cuidado y Amor',
    brand: 'UPPAbaby',
    price: 89.00,
    originalPrice: null,
    description: 'Portabebé ergonómico diseñado para mantener la postura natural del bebé mientras distribuye el peso equitativamente entre hombros y cadera.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbh_zsZQxMx0fNfMgkI2y5ywarUsyuRMcflrJWqxjwoYPtGE5DiNR_yIwf29QzL1mJSyW48CbfMjq2m-d1NCyXMzJbbs4V2IC5zYvLG_w8nWfBx8VkHPYqdPzNqVdVUBmv-DbuAmpJwYBoqeMpyORPHKx_5L1eUP1cERnq1JYuTHg8nNCS9uFBGA45z48tUE328OpbwYKfZzKiS-LD-B7JK-D0SwK7t4Uwl9eGS9Edq9GZHTvqti7RVPjoYCV04L6YpnXdlf6SEpv',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbh_zsZQxMx0fNfMgkI2y5ywarUsyuRMcflrJWqxjwoYPtGE5DiNR_yIwf29QzL1mJSyW48CbfMjq2m-d1NCyXMzJbbs4V2IC5zYvLG_w8nWfBx8VkHPYqdPzNqVdVUBmv-DbuAmpJwYBoqeMpyORPHKx_5L1eUP1cERnq1JYuTHg8nNCS9uFBGA45z48tUE328OpbwYKfZzKiS-LD-B7JK-D0SwK7t4Uwl9eGS9Edq9GZHTvqti7RVPjoYCV04L6YpnXdlf6SEpv'
    ],
    rating: 4.9,
    reviews: 324,
    features: ['Soporte lumbar ajustable', 'Múltiples posiciones de porteo', 'Tejido respirable', 'Recomendado por institutos de displasia'],
    inStock: true,
    stock: 15,
    createdAt: '2025-04-01',
    colors: ['Gris Oscuro', 'Verde Menta'],
    sizes: ['Ajustable']
  },
  {
    id: 8,
    name: 'Cuna Nórdica Madera Clara',
    category: 'baby_gear',
    subcategory: 'Nursery',
    brand: 'Nanit',
    price: 349.00,
    originalPrice: null,
    description: 'Cuna artesanal de madera clara sustentable. Combina líneas nórdicas modernas y se convierte fácilmente en cama de transición.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvg0CpquvOUQe-vcuJ3url2KYmvVjyd9HeAe29b2mKXWBawN88LkELkuXGz5LK6PI1HmjrL31N4tGsjb_NAx9cJxyQco2EMcoczoMBnaM2kcTttOVYqe7tfiN3Ev7i0a4McmLsfsk40buzxyxWxnUlJNbwYRZYyhYUnB4CfVQJSxW46vkSMdKX9f89X9OTnofYcf5kFUTMHKWXTxlWJ4gl9j12wFTzFGeKRIX7Y8imV0GmTZQlG6trJbXZ5xuRf0OQY5TKrP2koIxP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvg0CpquvOUQe-vcuJ3url2KYmvVjyd9HeAe29b2mKXWBawN88LkELkuXGz5LK6PI1HmjrL31N4tGsjb_NAx9cJxyQco2EMcoczoMBnaM2kcTttOVYqe7tfiN3Ev7i0a4McmLsfsk40buzxyxWxnUlJNbwYRZYyhYUnB4CfVQJSxW46vkSMdKX9f89X9OTnofYcf5kFUTMHKWXTxlWJ4gl9j12wFTzFGeKRIX7Y8imV0GmTZQlG6trJbXZ5xuRf0OQY5TKrP2koIxP'
    ],
    rating: 5.0,
    reviews: 156,
    features: ['Madera de pino macizo', 'Pinturas atóxicas certificadas', 'Somier ajustable en altura', 'Kit de conversión incluido'],
    inStock: true,
    stock: 1,
    createdAt: '2025-01-05',
    colors: ['Madera Natural'],
    sizes: ['140x70 cm']
  },
  {
    id: 9,
    name: 'Vigila Bebés HD Smart',
    category: 'smart_tech',
    subcategory: 'Baby Tech',
    brand: 'Nanit',
    price: 120.00,
    originalPrice: null,
    description: 'Cámara inteligente de alta definición con visión nocturna infrarroja, audio bidireccional y alertas automáticas de llanto directas a tu celular.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXTsCtKrup_x_OnxDIA_LP7XECb7KrsxbHFBrYBX-blUJGPcn6GrE2mqxbMFhsYQw6GAHV-7fUVNaJ2dY7TJqNMAze1fmFusDTkRUE33dpv3nT8v0rrIrkWIB-QRrLBHn8hrOWeLvIHH8pVHcBl1b4taf9q20h1y05HE7GyeJO4ktZnTtak0ysdsvKzGxBmTcHpDSPmHJDZSSOVp5nrbkLuu1B-oXmqrMIgJZu9KRRRbKYUbGdB7hDqOw_aCwvloFpHJVd7idQT_uF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXTsCtKrup_x_OnxDIA_LP7XECb7KrsxbHFBrYBX-blUJGPcn6GrE2mqxbMFhsYQw6GAHV-7fUVNaJ2dY7TJqNMAze1fmFusDTkRUE33dpv3nT8v0rrIrkWIB-QRrLBHn8hrOWeLvIHH8pVHcBl1b4taf9q20h1y05HE7GyeJO4ktZnTtak0ysdsvKzGxBmTcHpDSPmHJDZSSOVp5nrbkLuu1B-oXmqrMIgJZu9KRRRbKYUbGdB7hDqOw_aCwvloFpHJVd7idQT_uF'
    ],
    rating: 4.8,
    reviews: 210,
    features: ['Resolución HD 1080p', 'Visión nocturna automática', 'Sensor de temperatura', 'Comunicación de doble vía'],
    inStock: true,
    stock: 7,
    createdAt: '2025-02-05',
    colors: ['Blanco'],
    sizes: ['Única']
  },
  {
    id: 10,
    name: 'Netflix Premium',
    category: 'streaming',
    subcategory: 'Streaming Media',
    brand: 'Netflix',
    price: 4.99,
    originalPrice: null,
    description: '4K Ultra HD + HDR Profiles available. Watch up to 4 screens simultaneously without ads.',
    image: brandIcon('N', '#dc2626'),
    images: [brandIcon('N', '#dc2626')],
    rating: 4.9,
    reviews: 1260,
    features: ['Ultra HD 4K Resolution', 'HDR / Dolby Vision', '4 Simultaneous Screens', 'No interruptions'],
    inStock: true,
    stock: 999,
    createdAt: '2025-01-01',
    colors: ['Digital'],
    sizes: ['1 Mes']
  },
  {
    id: 11,
    name: 'Disney+ Access',
    category: 'streaming',
    subcategory: 'Streaming Media',
    brand: 'Disney',
    price: 3.50,
    originalPrice: null,
    description: 'IMAX Enhanced & GroupWatch ready. Stream Marvel, Star Wars, Pixar and Disney favorites.',
    image: brandIcon('D', '#0284c7'),
    images: [brandIcon('D', '#0284c7')],
    rating: 4.8,
    reviews: 840,
    features: ['IMAX Enhanced', '4K Streaming Support', 'GroupWatch feature', 'Unlimited Downloads'],
    inStock: true,
    stock: 999,
    createdAt: '2025-01-01',
    colors: ['Digital'],
    sizes: ['1 Mes']
  },
  {
    id: 12,
    name: 'HBO Max Gold',
    category: 'streaming',
    subcategory: 'Streaming Media',
    brand: 'HBO',
    price: 4.25,
    originalPrice: null,
    description: 'Access to all Warner Bros releases day-and-date. High definition streaming for movies and series.',
    image: brandIcon('H', '#7c3aed'),
    images: [brandIcon('H', '#7c3aed')],
    rating: 4.8,
    reviews: 950,
    features: ['Warner Bros Releases', '4K UHD Support', 'Offline Downloads', 'Profiles for Kids'],
    inStock: true,
    stock: 999,
    createdAt: '2025-01-01',
    colors: ['Digital'],
    sizes: ['1 Mes']
  },
  {
    id: 13,
    name: 'Spotify Premium',
    category: 'streaming',
    subcategory: 'Streaming Media',
    brand: 'Spotify',
    price: 2.99,
    originalPrice: null,
    description: 'Offline listening & zero ad interruptions. Stream high-fidelity audio worldwide.',
    image: brandIcon('S', '#10b981', '#052e16'),
    images: [brandIcon('S', '#10b981', '#052e16')],
    rating: 4.9,
    reviews: 1480,
    features: ['No Ad Interruptions', 'Offline Listening', 'High-Fidelity Audio', 'Unlimited Skips'],
    inStock: true,
    stock: 999,
    createdAt: '2025-01-01',
    colors: ['Digital'],
    sizes: ['1 Mes']
  },
  {
    id: 14,
    name: 'Suscripción Baby Play+',
    category: 'streaming',
    subcategory: 'Streaming Media',
    brand: 'Nanit',
    price: 12.99,
    originalPrice: null,
    description: 'Premium subscription for interactive learning, educational baby entertainment, and nursery lullabies.',
    image: brandIcon('B', '#5c4c3e'),
    images: [brandIcon('B', '#5c4c3e')],
    rating: 4.9,
    reviews: 88,
    features: ['Educational content', 'Ad-free baby songs', 'Cognitive development guides', '24/7 Lullaby Radio'],
    inStock: true,
    stock: 999,
    createdAt: '2025-01-01',
    colors: ['Digital'],
    sizes: ['1 Mes']
  }
];

export const getProducts = () => {
  return Promise.resolve(products);
};

export const getProductById = (id) => {
  const product = products.find(p => p.id === parseInt(id));
  return Promise.resolve(product || null);
};

export const getFeaturedProducts = () => {
  // Let's feature the baby carriers, crib, monitor, and subscriber cards
  // Specifically: Portabebé (7), Cuna (8), Vigila bebés (9), and Baby Play (14)
  const featuredIds = [7, 8, 9, 14];
  const featured = products.filter(p => featuredIds.includes(p.id));
  return Promise.resolve(featured);
};

export const getRelatedProducts = (category, currentId) => {
  const related = products.filter(p => p.category === category && p.id !== parseInt(currentId));
  if (related.length === 0) {
    return Promise.resolve(products.filter(p => p.id !== parseInt(currentId)).slice(0, 4));
  }
  return Promise.resolve(related.slice(0, 4));
};

export const getCategories = () => {
  const cats = [...new Set(products.map(p => p.category))];
  return Promise.resolve(cats);
};

export default products;
