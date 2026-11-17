import { makeCrud } from "../../../_lib/crud.js";
import { AVAILABILITY_COLS } from "../../../_lib/schemas.js";
const crud = makeCrud("availability", AVAILABILITY_COLS);
export const onRequestPatch = crud.update;
export const onRequestDelete = crud.remove;
