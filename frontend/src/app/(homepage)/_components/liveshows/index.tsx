import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
interface CardProps {
  image: string;
  title: string;
}
const Card: React.FC<CardProps> = ({ image, title }) => (
  <div className="bg-black rounded-[15px] text-white overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-110 cursor-pointer">
    <div className="relative">
      <Image
        src={image}
        alt={title}
        width={400}
        height={300}
        className="w-full h-52 object-cover"
      />
    </div>
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
    </div>
  </div>
);
const LiveShows: React.FC = () => {
  const moreShowsData: CardProps[] = [
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
    {
      image: "/assets/2card1.jpg",
      title: "Jew Man Group",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl text-center mt-16 mb-8">
        MORE GREAT VEGAS <span className="text-blue-500">LIVE</span> SHOWS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {moreShowsData.map((show, index) => (
          <Card key={index} image={show.image} title={show.title} />
        ))}
      </div>
      <Button className="flex items-center m-auto mt-9 bg-[#004DE1] text-white">
        Load More
      </Button>
    </div>
  );
};

export default LiveShows;
