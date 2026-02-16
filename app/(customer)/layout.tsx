import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export default function CustomerLayout({
  children,
}: {
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * CustomerLayout component
   *
   * This component is used to wrap the customer pages
   * It contains the navigation bar and the main content
   *
   * @param {React.ReactNode} children - The content of the page
   * @returns {JSX.Element}
   */
  /*******  c8194230-ad65-48e9-b3ef-950eaedf25e1  *******/ children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
