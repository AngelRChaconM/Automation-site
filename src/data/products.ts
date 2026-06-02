export type Product = {
  id: number;
  name: string;
  price: number;
  category: 'women' | 'men' | 'kids';
  brand: string;
  description: string;
  image: string;
};

/** Local SVG assets — work offline, no third-party CDN. */
const img = (id: number) => `/products/product-${id}.svg`;

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Blue Top', price: 19, category: 'women', brand: 'Polo', description: 'Lightweight blue top, perfect for casual wear.', image: img(1) },
  { id: 2, name: 'Men Tshirt', price: 15, category: 'men', brand: 'H&M', description: 'Comfortable cotton tshirt for daily use.', image: img(2) },
  { id: 3, name: 'Sleeveless Dress', price: 45, category: 'women', brand: 'Madame', description: 'Elegant sleeveless dress for evenings.', image: img(3) },
  { id: 4, name: 'Stylish Dress', price: 59, category: 'women', brand: 'Biba', description: 'Trendy patterned dress.', image: img(4) },
  { id: 5, name: 'Winter Top', price: 29, category: 'women', brand: 'Mast & Harbour', description: 'Warm winter top with knit detailing.', image: img(5) },
  { id: 6, name: 'Summer White Top', price: 15, category: 'women', brand: 'H&M', description: 'Breathable summer white top.', image: img(6) },
  { id: 7, name: 'Premium Polo T-Shirt', price: 35, category: 'men', brand: 'Polo', description: 'Premium quality polo tshirt.', image: img(7) },
  { id: 8, name: 'Pure Cotton V-Neck T-Shirt', price: 25, category: 'men', brand: 'Allen Solly Junior', description: 'Pure cotton v-neck.', image: img(8) },
  { id: 9, name: 'Soft Stretch Jeans', price: 39, category: 'men', brand: 'H&M', description: 'Soft stretch jeans, slim fit.', image: img(9) },
  { id: 10, name: 'Regular Fit Straight Jeans', price: 49, category: 'men', brand: 'Mast & Harbour', description: 'Classic straight fit jeans.', image: img(10) },
  { id: 11, name: 'Frozen Tops For Kids', price: 12, category: 'kids', brand: 'Kookie Kids', description: 'Frozen themed top for kids.', image: img(11) },
  { id: 12, name: 'Little Girls Panda Shirt', price: 22, category: 'kids', brand: 'Babyhug', description: 'Cute panda print shirt.', image: img(12) },
];

export const BRANDS = Array.from(
  PRODUCTS.reduce<Map<string, number>>((acc, p) => {
    acc.set(p.brand, (acc.get(p.brand) ?? 0) + 1);
    return acc;
  }, new Map())
).map(([brand, count]) => ({ brand, count }));

export const CATEGORIES: Array<{ id: Product['category']; label: string; subs: string[] }> = [
  { id: 'women', label: 'Women', subs: ['Dress', 'Tops', 'Saree'] },
  { id: 'men', label: 'Men', subs: ['Tshirts', 'Jeans'] },
  { id: 'kids', label: 'Kids', subs: ['Dress', 'Tops & Shirts'] },
];
