import type { BasketDto } from "@realkoder/antik-moderne-shared-types";
import {atom} from "jotai";

export const cartAtom = atom<BasketDto>();