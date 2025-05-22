import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Divider } from "~/components/Divider";
import { IoTrashOutline } from "react-icons/io5";
import { useSetAtom } from "jotai";
import { postersAtom } from "~/atoms/postersAtom";
import type { PosterDto } from "@realkoder/antik-moderne-shared-types";
import { useFetch } from "~/lib/api-client";
import { toast } from "sonner";

interface TabProductCardProps {
  poster: PosterDto;
}

export const TabPosterCard = ({ poster }: TabProductCardProps) => {
  const setPosters = useSetAtom(postersAtom);
  const { fetchData } = useFetch<{ posters: PosterDto[] }>();

  const handleDeletePoster = async () => {
    // const response = await authRequestClient.product.deletePoster(poster.id);
    const response = await fetchData(
      `/products/auth/api/posters/${poster.id}`, {method: "DELETE"}
    );
    if (response?.posters) {
      toast.info("Poster deleted");
      setPosters(response?.posters);
    }
  };

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="text-center flex-col justify-center items-center">
        <div className="flex gap-x-1">
          <CardTitle>{poster.title}</CardTitle>
          <IoTrashOutline
            onClick={() => handleDeletePoster()}
            className="cursor-pointer text-red-500"
          />
        </div>
        <div className="flex text-sm font-serif">
          <p>Created:</p>
          <p className="ml-1 italic">{`${
            new Date().toISOString().split("T")[0]
          }`}</p>
        </div>
      </CardHeader>

      <Divider />

      <CardContent className="mt-2 flex flex-col items-center">
        <img
          key={poster.id}
          className="w-40 h-40 border-4 border-gray-400 p-0.5 shadow-lg rounded-2xl hover:scale-150 transition-transform duration-150"
          src={poster.posterImageUrl}
          alt={poster.title}
        />
      </CardContent>

      <Divider />
      <CardFooter className="flex-col justify-between text-sm font-serif">
        <div className="flex ">
          <p>Artist:</p>
          <p className="ml-1 italic">{`${poster.artistFullName}`}</p>
        </div>
        <p>kr. {`${poster.formatPrices[0].price.toFixed(2)},-`}</p>
      </CardFooter>
    </Card>
  );
};
