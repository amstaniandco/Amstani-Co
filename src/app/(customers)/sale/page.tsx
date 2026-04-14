import Image from "next/image";
import { ShoppingCart, Star, Box } from "lucide-react";

const products = Array(9).fill({
  name: "Name of product",
  store: "Store name",
  price: 51,
  oldPrice: 60,
  rating: 4.9,
  image: "/pants.jpg", // put your image in /public
});

export default function SalePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-6xl bg-gray-50 rounded-3xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-cyan-100 flex items-center justify-center">
            <Box className="h-4 w-4 text-cyan-600" />
          </div>
          <h2 className="font-semibold text-black">Our Products</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100"
            >
              {/* Image */}
              <div className="w-full h-56 relative rounded-2xl overflow-hidden mb-4">
                <Image
                  src={item.image}
                  alt="product"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title + Rating */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-black">{item.name}</h3>
                <div className="flex items-center gap-1 text-black text-sm">
                  <Star size={14} className="text-cyan-600" />
                  {item.rating}
                </div>
              </div>

              {/* Store */}
              <p className="text-sm text-black mb-3">{item.store}</p>

              {/* Price + Button */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-lg text-black">${item.price}</span>
                  <span className="text-black line-through ml-2 text-sm">
                    ${item.oldPrice}
                  </span>
                </div>

                <button className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full transition">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
