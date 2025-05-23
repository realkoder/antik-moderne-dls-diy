import { useAtom } from "jotai";
import type { Route } from "./+types/posters";
import { postersAtom } from "~/atoms/postersAtom";
import { useEffect } from "react";
import { PosterDisplayer } from "~/components/posters/postersDisplayer";
import { useFetch } from "~/lib/api-client";
import type { PosterDto } from "@realkoder/antik-moderne-shared-types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Posters - Antik Moderne" }, { name: "description", content: "Posters" }];
}

export function loader({}: Route.LoaderArgs) {
  return (async () => {
    try {
      const { fetchData } = useFetch<{ posters: PosterDto[] }>();
      const posters = await fetchData("/products/api/v1/posters");
      return posters;
    } catch (e) {
      console.error("Error fethcing posters", e);
      return { posters: [] as PosterDto[] };
    }
  })();
}

// export default function Posters({ loaderData }: Route.ComponentProps) {
export default function Posters({ loaderData }: Route.ComponentProps) {
  const { posters: fetchedPosters } = loaderData;
  const [posters, setPosters] = useAtom(postersAtom);

  useEffect(() => {
    if (posters.length > 0) return;
    if (fetchedPosters) {
      setPosters(fetchedPosters);
    }
  }, [fetchedPosters, setPosters]);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-4">Antik Moderne Posters</h1>
      <p className=" text-2xl mb-6">
        Discover a curated collection of timeless posters that blend the elegance of the past with the modern aesthetic.
      </p>
      <PosterDisplayer />
    </div>
  );
}
