import { type PosterDto } from "@realkoder/antik-moderne-shared-types";
import {atom} from "jotai";

export const postersAtom = atom<PosterDto[]>([]);