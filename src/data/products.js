const products = [
  {
    id: 1,
    name: 'Mameluco de Algodón Orgánico',
    category: 'mamelucos',
    price: 45.00,
    originalPrice: null,
    description: 'Suave mameluco confeccionado al 100% con algodón orgánico certificado, ideal para la piel sensible de tu recién nacido. Cuenta con broches hipoalergénicos libres de níquel para un cambio fácil.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXTsCtKrup_x_OnxDIA_LP7XECb7KrsxbHFBrYBX-blUJGPcn6GrE2mqxbMFhsYQw6GAHV-7fUVNaJ2dY7TJqNMAze1fmFusDTkRUE33dpv3nT8v0rrIrkWIB-QRrLBHn8hrOWeLvIHH8pVHcBl1b4taf9q20h1y05HE7GyeJO4ktZnTtak0ysdsvKzGxBmTcHpDSPmHJDZSSOVp5nrbkLuu1B-oXmqrMIgJZu9KRRRbKYUbGdB7hDqOw_aCwvloFpHJVd7idQT_uF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXTsCtKrup_x_OnxDIA_LP7XECb7KrsxbHFBrYBX-blUJGPcn6GrE2mqxbMFhsYQw6GAHV-7fUVNaJ2dY7TJqNMAze1fmFusDTkRUE33dpv3nT8v0rrIrkWIB-QRrLBHn8hrOWeLvIHH8pVHcBl1b4taf9q20h1y05HE7GyeJO4ktZnTtak0ysdsvKzGxBmTcHpDSPmHJDZSSOVp5nrbkLuu1B-oXmqrMIgJZu9KRRRbKYUbGdB7hDqOw_aCwvloFpHJVd7idQT_uF'
    ],
    rating: 4.9,
    reviews: 145,
    features: ['100% Algodón Orgánico', 'Tinte natural hipoalergénico', 'Broches libres de níquel', 'Apto para lavadora'],
    inStock: true,
    createdAt: '2025-01-10',
    colors: ['Crema', 'Blanco', 'Gris'],
    sizes: ['RN', '0-3m', '3-6m', '6-12m']
  },
  {
    id: 2,
    name: 'Conjunto de Lino Primavera',
    category: 'conjuntos',
    price: 68.90,
    originalPrice: 85.00,
    description: 'Conjunto fresco de lino y algodón suave en color verde menta. Incluye camisa de botones de madera y pantalón corto con cintura elástica cómoda.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbh_zsZQxMx0fNfMgkI2y5ywarUsyuRMcflrJWqxjwoYPtGE5DiNR_yIwf29QzL1mJSyW48CbfMjq2m-d1NCyXMzJbbs4V2IC5zYvLG_w8nWfBx8VkHPYqdPzNqVdVUBmv-DbuAmpJwYBoqeMpyORPHKx_5L1eUP1cERnq1JYuTHg8nNCS9uFBGA45z48tUE328OpbwYKfZzKiS-LD-B7JK-D0SwK7t4Uwl9eGS9Edq9GZHTvqti7RVPjoYCV04L6YpnXdlf6SEpv',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbh_zsZQxMx0fNfMgkI2y5ywarUsyuRMcflrJWqxjwoYPtGE5DiNR_yIwf29QzL1mJSyW48CbfMjq2m-d1NCyXMzJbbs4V2IC5zYvLG_w8nWfBx8VkHPYqdPzNqVdVUBmv-DbuAmpJwYBoqeMpyORPHKx_5L1eUP1cERnq1JYuTHg8nNCS9uFBGA45z48tUE328OpbwYKfZzKiS-LD-B7JK-D0SwK7t4Uwl9eGS9Edq9GZHTvqti7RVPjoYCV04L6YpnXdlf6SEpv'
    ],
    rating: 4.7,
    reviews: 98,
    features: ['Mezcla Premium Lino/Algodón', 'Botones de madera natural', 'Cintura ajustable', 'Transpirable y liviano'],
    inStock: true,
    createdAt: '2025-02-15',
    colors: ['Verde Menta', 'Beige', 'Azul'],
    sizes: ['3-6m', '6-12m', '1-2 años', '3-5 años']
  },
  {
    id: 3,
    name: 'Pijama Soft Nightbear',
    category: 'pijamas',
    price: 32.00,
    originalPrice: 40.00,
    description: 'Pijama cómoda de dos piezas con adorable estampado de ositos. Fabricado en algodón perchado ultra suave para las noches más tranquilas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO8fa5Js-erQgIwSew5ta542boru4zGVhnl_VCo06LiQqP2B9IRXInboYv6cW1Mdb9mbcy8vC0e789K422Fh1w1oN70Cz_mZeowj_9VFmHcj3es4COrP-omPb7x0ajPefFhpkKhzsLF2-VAiZlBWNDIj5SFjWvWdwTeNMRMovA6CI5foTRFaM9YOE7WASKg3TtUBoVh4CUQVyfYUmdcVNIioycFCj51MQxXJcVCEMjjOF_v9clWgi6KLcL1Dbij9HB2fci14b8x3NF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCO8fa5Js-erQgIwSew5ta542boru4zGVhnl_VCo06LiQqP2B9IRXInboYv6cW1Mdb9mbcy8vC0e789K422Fh1w1oN70Cz_mZeowj_9VFmHcj3es4COrP-omPb7x0ajPefFhpkKhzsLF2-VAiZlBWNDIj5SFjWvWdwTeNMRMovA6CI5foTRFaM9YOE7WASKg3TtUBoVh4CUQVyfYUmdcVNIioycFCj51MQxXJcVCEMjjOF_v9clWgi6KLcL1Dbij9HB2fci14b8x3NF'
    ],
    rating: 4.8,
    reviews: 215,
    features: ['Algodón perchado premium', 'Estampado ecológico al agua', 'Puños acanalados', 'Corte relajado'],
    inStock: true,
    createdAt: '2025-03-01',
    colors: ['Azul Grisáceo', 'Rosa Pastel', 'Crema'],
    sizes: ['6-12m', '1-2 años', '3-5 años']
  },
  {
    id: 4,
    name: 'Gorro Tejido Nube',
    category: 'accesorios',
    price: 18.50,
    originalPrice: null,
    description: 'Sombrerito de punto tejido a mano en hilo de algodón hipoalergénico. Mantiene la cabeza de tu bebé abrigada con suavidad excepcional y estilo adorable.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBIJ-epbEGKoBO-styIW847aqmbhTnWvUAYD_ahsV_QakvUStF68FGEJARiurvurmH1zeMpn819btd4HBlAuuOkfdvjO-2wtLoxpdS0NcWJ5hBCiy20LsNs533vovXOpgcsV3SgzTxVXYJL5N3TtuBJxfLlZ3cOKkzYlmhXb69fHTQRb7CCttEeMlhBwz_5yYyGFC8Y3_UgRhx1ocdeMLMmY38gAwMS6zJCndsDqYHM3S5CEJjs05EmuPs8J8iBvu9LWKEgL_oICRP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBIJ-epbEGKoBO-styIW847aqmbhTnWvUAYD_ahsV_QakvUStF68FGEJARiurvurmH1zeMpn819btd4HBlAuuOkfdvjO-2wtLoxpdS0NcWJ5hBCiy20LsNs533vovXOpgcsV3SgzTxVXYJL5N3TtuBJxfLlZ3cOKkzYlmhXb69fHTQRb7CCttEeMlhBwz_5yYyGFC8Y3_UgRhx1ocdeMLMmY38gAwMS6zJCndsDqYHM3S5CEJjs05EmuPs8J8iBvu9LWKEgL_oICRP'
    ],
    rating: 4.9,
    reviews: 62,
    features: ['Tejido a mano artesanal', '100% Hilo de Algodón', 'Muy flexible y suave', 'Hipoalergénico'],
    inStock: true,
    createdAt: '2025-01-20',
    colors: ['Blanco Nube', 'Rosa', 'Amarillo'],
    sizes: ['RN', '0-3m', '3-6m']
  },
  {
    id: 5,
    name: 'Patucos de Piel Suave',
    category: 'calzado',
    price: 55.00,
    originalPrice: null,
    description: 'Zapatitos artesanales de cuero natural extra suave en tono beige. Suela flexible que respeta el crecimiento natural del pie de tu bebé.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP3bnCuyNLmzv1POZX2jy7UzrC_XSHNdPK3SxSlBRI0UeGRFdVwEYWlSwuJ2jX-0WS8-nzx9503-KFFeWDGAkaOJ7icuvQ-rBo-_ZSx8IY6RHBZtdav_pxGf_NnWXSIl0FbS_J3JHrOA_7U3xDX4CrVFlSjy4nw_A5RiDv-mqpZGtcPaRpNUa8VvmMpxsIZbmbnh3UBIUNjv5_1QnFucx6GgA1tq5RhRxI9KIaifMFnlVjFMWUg6Xl0ImXuFMWE86mGZfa2niSFf8Z',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP3bnCuyNLmzv1POZX2jy7UzrC_XSHNdPK3SxSlBRI0UeGRFdVwEYWlSwuJ2jX-0WS8-nzx9503-KFFeWDGAkaOJ7icuvQ-rBo-_ZSx8IY6RHBZtdav_pxGf_NnWXSIl0FbS_J3JHrOA_7U3xDX4CrVFlSjy4nw_A5RiDv-mqpZGtcPaRpNUa8VvmMpxsIZbmbnh3UBIUNjv5_1QnFucx6GgA1tq5RhRxI9KIaifMFnlVjFMWUg6Xl0ImXuFMWE86mGZfa2niSFf8Z'
    ],
    rating: 4.6,
    reviews: 73,
    features: ['Cuero natural curtido ecológico', 'Suela de gamuza antideslizante', 'Elástico de ajuste suave', 'Hecho a mano'],
    inStock: true,
    createdAt: '2025-02-10',
    colors: ['Beige', 'Gris', 'Café'],
    sizes: ['0-3m', '3-6m', '6-12m']
  },
  {
    id: 6,
    name: 'Set Marinerito Algodón',
    category: 'conjuntos',
    price: 42.90,
    originalPrice: null,
    description: 'Conjunto marinero de dos piezas. Incluye un body de manga corta de algodón de rayas azules y pantalón liso a juego con cordón decorativo.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvYM_yi7YHwTgpjN5kHBM1cmlyhH82mxczNISgiiejHdSWB-j743wbEzCH0W-B4RP4LK0BQ33AeZXm9Qe594iJI1QssTXjag1UgFM2xbwGuyaYikzNp7oQHecJMUqTExERvf4nTGZIuii7VHIW38lJ-gxgEFMwYTQYOlmtAFPAEZO2fjY5YA2vePp8u00SvL293cCkUQs8lyj-883FoDLwckpPjlQlKrkw_xFYsj5cRTlYgCFky-8O93yJTeOtOHaiTJg4PCVthjNT',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvYM_yi7YHwTgpjN5kHBM1cmlyhH82mxczNISgiiejHdSWB-j743wbEzCH0W-B4RP4LK0BQ33AeZXm9Qe594iJI1QssTXjag1UgFM2xbwGuyaYikzNp7oQHecJMUqTExERvf4nTGZIuii7VHIW38lJ-gxgEFMwYTQYOlmtAFPAEZO2fjY5YA2vePp8u00SvL293cCkUQs8lyj-883FoDLwckpPjlQlKrkw_xFYsj5cRTlYgCFky-8O93yJTeOtOHaiTJg4PCVthjNT'
    ],
    rating: 4.8,
    reviews: 112,
    features: ['100% Algodón Pima', 'Ajuste cómodo y elástico', 'Tinte libre de metales pesados', 'Estilo clásico náutico'],
    inStock: true,
    createdAt: '2025-03-05',
    colors: ['Rayas Azules', 'Blanco', 'Gris'],
    sizes: ['RN', '0-3m', '3-6m', '6-12m']
  },
  {
    id: 7,
    name: 'Pack x3 Baberos Silicona',
    category: 'accesorios',
    price: 29.00,
    originalPrice: null,
    description: 'Set de 3 baberos de silicona grado alimenticio impermeables en colores pasteles muy estéticos. Con amplio bolsillo receptor y cierre de cuello ajustable.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJk5Jh0HhslAdrhi75n2wB2EwaiSPFUghLHNoMjBmzBUeLpj1gz5dk_DJ-S5ZrAl6uLs0R-DJ9fXaW3IrpI1DrIRE8INuYzbc87UanuPzKx2WKEm04dEuzmdPhTRrvywR9ESn-shIN7q6rXbrkxwB7-4BUQLZ7-1MDH9PP3NVYD6YjjKMdCaPDR5zfywoSL3CM0wvRizIr-dXn57vXgdI1qY7ssVCFX5OC8zzK9BZUVSwvh3U5RXCTsDDn_Mo-RXNNTyIMgge-CCw',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJk5Jh0HhslAdrhi75n2wB2EwaiSPFUghLHNoMjBmzBUeLpj1gz5dk_DJ-S5ZrAl6uLs0R-DJ9fXaW3IrpI1DrIRE8INuYzbc87UanuPzKx2WKEm04dEuzmdPhTRrvywR9ESn-shIN7q6rXbrkxwB7-4BUQLZ7-1MDH9PP3NVYD6YjjKMdCaPDR5zfywoSL3CM0wvRizIr-dXn57vXgdI1qY7ssVCFX5OC8zzK9BZUVSwvh3U5RXCTsDDn_Mo-RXNNTyIMgge-CCw'
    ],
    rating: 4.7,
    reviews: 182,
    features: ['100% Silicona Grado Alimenticio', 'Libre de BPA, PVC y Ftalatos', 'Impermeable y fácil de limpiar', 'Cuello ajustable de 4 posiciones'],
    inStock: true,
    createdAt: '2025-04-01',
    colors: ['Mix Pastel', 'Verde', 'Rosa', 'Gris'],
    sizes: ['Ajustable']
  },
  {
    id: 8,
    name: 'Conjunto Lana Merino',
    category: 'recien_nacidos',
    price: 95.00,
    originalPrice: null,
    description: 'Conjunto de invierno tejido en lana Merino superfina de primera calidad. Máximo confort térmico para el recién nacido con total transpirabilidad y suavidad sin picazón.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5r88sGeoasfN61uQYqXgRp-C7_WgUFh3Qg14Hlz7lUhXFFl9EFGCezRybU2qOi0Jkgo1W0GXpVjl8ZFguP_RLiuok8mBsdY726ir893DfWoSroZsvEZXf0CXN0RfnF5fYLZSTs-5WYC6uPD5ibx5zgdodaCNvXf-pghslAASj7HGVlsro0TE3RiMVMpOi5SXnxDDbU8itURPAqrgSk3aZ-fwKRZv1YrAHTnJphw36pL-jB77Z2OGhu9MPWTvrugdbveUI-vue29uF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5r88sGeoasfN61uQYqXgRp-C7_WgUFh3Qg14Hlz7lUhXFFl9EFGCezRybU2qOi0Jkgo1W0GXpVjl8ZFguP_RLiuok8mBsdY726ir893DfWoSroZsvEZXf0CXN0RfnF5fYLZSTs-5WYC6uPD5ibx5zgdodaCNvXf-pghslAASj7HGVlsro0TE3RiMVMpOi5SXnxDDbU8itURPAqrgSk3aZ-fwKRZv1YrAHTnJphw36pL-jB77Z2OGhu9MPWTvrugdbveUI-vue29uF'
    ],
    rating: 4.9,
    reviews: 43,
    features: ['100% Lana Merino superfina', 'Regulador térmico natural', 'Hipoalergénico y antibacteriano', 'Diseño de punto clásico'],
    inStock: true,
    createdAt: '2025-01-05',
    colors: ['Gris Oscuro', 'Beige', 'Azul'],
    sizes: ['RN', '0-3m', '3-6m']
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
  return Promise.resolve(products.slice(0, 4));
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
