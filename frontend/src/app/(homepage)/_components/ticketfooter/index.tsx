import React from "react";
import Link from "next/link";
import Image from "next/image";

const TicketFooter = () => {
  return (
    <footer className="bg-[#141414] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/assets/ticket-logo.png"
              alt="Ticket Kite"
              width={120}
              height={40}
              className="mb-4"
            />
            <div className="space-y-2 text-gray-300">
              <p>Call: 702-483-8056</p>
              <p>Email: info@ticketkite.com</p>
              <div className="mt-4">
                <p>Our Corporate Offices:</p>
                <p>375 E. Harmon Ave</p>
                <p>Las Vegas, NV 89169</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sitemaps</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/all-motown"
                className="text-gray-300 hover:text-white transition-colors"
              >
                All Motown
              </Link>
              <Link
                href="/king-of-diamonds"
                className="text-gray-300 hover:text-white transition-colors"
              >
                King of Diamonds – The Neil Diamond Tribute
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Support</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="/orders"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/downloads"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Downloads
              </Link>
              <Link
                href="/account"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Account details
              </Link>
              <Link
                href="/lost-password"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Lost password
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get To Know Us</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/faq"
                className="text-gray-300 hover:text-white transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm">
          © 2024 TicketKite.com /
          <Link
            href="/terms"
            className="hover:text-white transition-colors mx-1"
          >
            Terms & Condition
          </Link>{" "}
          /
          <Link
            href="/privacy"
            className="hover:text-white transition-colors ml-1"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default TicketFooter;
