import { makeCrud } from "../../_lib/crud.js";
import { PRODUCT_COLS, PRODUCT_ENUMS } from "../../_lib/schemas.js";
const crud = makeCrud("products", PRODUCT_COLS, { orderBy: "created_date DESC", enums: PRODUCT_ENUMS });
export const onRequestGet = crud.list;
export const onRequestPost = crud.create;
