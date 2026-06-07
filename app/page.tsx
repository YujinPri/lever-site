import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import StackStrip from "@/components/StackStrip";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Availability from "@/components/Availability";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

export default function Home() {
  return (
    <>
      <CursorGlow />
      <Nav />
      <Hero />
      <StackStrip />
      <Services />
      <Process />
      <Availability />
      <Contact />
      <Footer />
    </>
  );
}
