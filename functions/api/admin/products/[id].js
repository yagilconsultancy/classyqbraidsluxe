import { makeCrud } from "../../../_lib/crud.js";
import { PRODUCT_COLS, PRODUCT_ENUMS } from "../../../_lib/schemas.js";
const crud = makeCrud("products", PRODUCT_COLS, { enums: PRODUCT_ENUMS });
export const onRequestPatch = crud.update;
export const onRequestDelete = crud.remove;
