import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TicketFilter = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-0 bg-[#1f1f1f] rounded-lg shadow-lg relative z-10">
      <Input
        type="search"
        placeholder="Search..."
        className="flex-1 border-[#232427] bg-black rounded-tr-none rounded-br-none rounded-tl-lg rounded-bl-lg text-white placeholder-gray-400 px-4 h-14"
      />
      <Select>
        <SelectTrigger className="w-[240px] border-[#232427] bg-black rounded-none text-gray-400 h-14">
          <SelectValue placeholder="11/19/2024 - 11/19/2024" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="tomorrow">Tomorrow</SelectItem>
          <SelectItem value="weekend">This Weekend</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[160px] border-[#232427] bg-black rounded-none text-gray-400 h-14">
          <SelectValue placeholder="2 Seats" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 Seat</SelectItem>
          <SelectItem value="2">2 Seats</SelectItem>
          <SelectItem value="3">3 Seats</SelectItem>
          <SelectItem value="4">4 Seats</SelectItem>
        </SelectContent>
      </Select>
      <Button className="bg-blue-600 hover:bg-blue-700 border-[#232427] text-white px-8 h-14 rounded-tl-none rounded-bl-none text-base font-medium">
        Find Ticket
      </Button>
    </div>
  );
};

export default TicketFilter;
