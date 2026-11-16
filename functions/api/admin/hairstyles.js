import { makeCrud } from "../../_lib/crud.js";
import { HAIRSTYLE_COLS, HAIRSTYLE_ENUMS } from "../../_lib/schemas.js";
const crud = makeCrud("hairstyles", HAIRSTYLE_COLS, { orderBy: "sort_order ASC, name ASC", enums: HAIRSTYLE_ENUMS });
export const onRequestGet = crud.list;
export const onRequestPost = crud.create;
