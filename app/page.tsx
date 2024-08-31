import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainConatiner from "@/components/MainContainer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      {/* MainContainer */}
      <MainConatiner />
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
