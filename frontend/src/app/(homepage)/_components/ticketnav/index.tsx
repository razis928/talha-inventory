import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const TicketNav = () => {
  return (
    <header className=" mx-auto py-4 px-4 bg-[rgba(20,20,20,1)]">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Image
            src="/assets/ticket-logo.png"
            alt="Ticket Kite"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <div className="hidden md:flex items-center space-x-6 text-white">
            {[
              "SHOWS",
              "TOURS",
              "ATTRACTIONS",
              "HOTELS",
              "TIPS & TRICKS",
              "FAQS",
              "CONTACT US",
            ].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                className="hover:text-blue-500 transition-colors text-sm font-medium uppercase tracking-widest"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {[HelpCircle, ShoppingCart, User].map((Icon, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-500"
            >
              <Icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default TicketNav;
