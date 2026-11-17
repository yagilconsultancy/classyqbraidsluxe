import { makeCrud } from "../../../_lib/crud.js";
import { HAIRSTYLE_COLS, HAIRSTYLE_ENUMS } from "../../../_lib/schemas.js";
const crud = makeCrud("hairstyles", HAIRSTYLE_COLS, { enums: HAIRSTYLE_ENUMS });
export const onRequestPatch = crud.update;
export const onRequestDelete = crud.remove;
