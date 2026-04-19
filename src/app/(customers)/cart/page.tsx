import CartItems from "./components/CartItems";
import CartSummary from "./components/CartSummary";

type CartProduct = {
  id: number;
  image: string;
  store: string;
  name: string;
  variant: string;
  price: number;
};

const products: CartProduct[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
];

export default function CartPage() {
  const subtotal = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:items-start lg:gap-8 lg:py-8">
        <div className="w-full lg:basis-[65%]">
          <CartItems products={products} />
        </div>
        <div className="w-full lg:basis-[35%]">
          <CartSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
