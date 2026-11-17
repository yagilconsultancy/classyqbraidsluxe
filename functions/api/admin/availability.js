import { makeCrud } from "../../_lib/crud.js";
import { AVAILABILITY_COLS } from "../../_lib/schemas.js";
const crud = makeCrud("availability", AVAILABILITY_COLS, { orderBy: "specific_date ASC, day_of_week ASC, start_time ASC" });
export const onRequestGet = crud.list;
export const onRequestPost = crud.create;
