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
    <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-8 px-4 py-8 xl:flex-row xl:items-start">
      <div className="w-full xl:basis-[70%]">
        <CartItems products={products} />
      </div>
      <div className="w-full xl:basis-[30%]">
        <CartSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
