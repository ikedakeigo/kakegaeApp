import { PostGrid } from "@/components/post-grid";
import { PostFilters } from "@/components/post-filters";

export default function Home() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Recent Posts</h1>
        <PostFilters />
      </div>
      <PostGrid />
    </div>
  );
}