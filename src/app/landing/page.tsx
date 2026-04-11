import {
  ArrowRight,
  ShoppingBag,
  Star,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import AmericaMap from "../../components/AmericaMap";
import DigitalMallSection from "../../components/pages/DigitalMallSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Map Hero Section */}
      <section className="py-2 sm:py-4">
        <div className="w-full px-4 sm:px-6">
          <AmericaMap />
        </div>
      </section>

      <DigitalMallSection />

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="w-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Amstani Co?
            </h2>
            <p className="text-lg text-slate-600">
              We're committed to providing the best experience for our customers
              through quality, service, and innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Curated Selection
              </h3>
              <p className="text-slate-600">
                Hand-picked products from trusted brands and artisans worldwide,
                ensuring quality and uniqueness in every purchase.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Fast Delivery
              </h3>
              <p className="text-slate-600">
                Quick and reliable shipping options to get your orders to you
                safely and on time, wherever you are.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Secure Shopping
              </h3>
              <p className="text-slate-600">
                Your privacy and security are our top priorities with encrypted
                transactions and secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="w-full px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg text-blue-100">Products Sold</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">99%</div>
              <div className="text-lg text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take our word for it - hear from our satisfied
              customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "Excellent quality products and outstanding customer service.
                I've been shopping here for months and never been disappointed."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Sarah Johnson
                  </div>
                  <div className="text-sm text-slate-500">
                    Verified Customer
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "Fast shipping and great prices. The product quality exceeded my
                expectations. Will definitely order again!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Michael Chen
                  </div>
                  <div className="text-sm text-slate-500">
                    Verified Customer
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "Amazing selection and user-friendly website. Customer support
                is responsive and helpful. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Emily Rodriguez
                  </div>
                  <div className="text-sm text-slate-500">
                    Verified Customer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="w-full px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of satisfied customers and discover what makes
            Amstani Co special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="inline-flex items-center px-8 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            Use the navigation bar above to access role-specific pages and
            features.
          </p>
        </div>
      </section>
    </div>
  );
}
