import PostGrid from "@/components/post-grid";
import PostFilters from "@/components/post-filters";

const Home = () => {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-center text-2xl font-bold">KAKEGAE</h1>
      <PostFilters />
      <PostGrid />
    </div>
  );
};

export default Home;
