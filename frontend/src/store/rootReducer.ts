import { combineReducers } from "redux";
import { authReducer } from "@/modules/auth/store/reducer";
import { programsReducer } from "@/modules/programs/store/reducer";
import { sessionsReducer } from "@/modules/sessions/store/reducer";
import { auditReducer } from "@/modules/audit/store/reducer";
import { importReducer } from "@/modules/import/store/reducer";

export const rootReducer = combineReducers({
  auth: authReducer,
  programs: programsReducer,
  sessions: sessionsReducer,
  audit: auditReducer,
  import: importReducer,
});
