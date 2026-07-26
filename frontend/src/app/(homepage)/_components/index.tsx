import TicketFilter from "./ticketfilter/index";
import FeaturedShows from "./featuredshows/index";
import LiveShows from "./liveshows/index";

const TicketMian = () => {
  return (
    <div className="w-full bg-[#141414] text-white">
      <div
        className="container mx-auto px-4 py-16 text-center bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/mnt/data/header-ticket.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-[#141414]/60"></div>
        <h1 className="text-5xl md:text-5xl font-bold text-white mb-6 leading-tight relative z-10">
          Get Ready to Elevate Your Entertainment Experience
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 relative z-10">
          Your Ticket to Memorable Moments: Where Every Ticket Unlocks
          Adventure, Laughter, and Memories!
        </p>
        <TicketFilter />
      </div>
      <FeaturedShows shows={[]} />
      <LiveShows />
    </div>
  );
};

export default TicketMian;
